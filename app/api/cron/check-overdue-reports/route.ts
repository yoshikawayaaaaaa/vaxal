import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { notifyReportOverdue } from '@/lib/notifications'

/**
 * 報告遅延チェックCron Job
 * 毎日午前9時に実行され、工事日が過去で報告未提出の案件をチェック
 */
export async function GET(request: NextRequest) {
  try {
    // Vercel Cronからのリクエストを検証（本番環境のみ）
    const authHeader = request.headers.get('authorization')
    if (process.env.NODE_ENV === 'production') {
      if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    // 今日の日付（JST）を取得
    const now = new Date()
    const jstOffset = 9 * 60 * 60 * 1000
    const jstNow = new Date(now.getTime() + jstOffset)
    
    // 今日の0時0分0秒（JST）
    const today = new Date(jstNow)
    today.setUTCHours(0, 0, 0, 0)

    // 工事日が過去で、ステータスがASSIGNED（報告未提出）の案件を取得
    const overdueProjects = await prisma.project.findMany({
      where: {
        workDate: {
          lt: today, // 工事日が今日より前
        },
        status: 'ASSIGNED', // 報告未提出
        assignedEngineerId: {
          not: null, // エンジニアが割り振られている
        },
      },
      select: {
        id: true,
        projectNumber: true,
        workDate: true,
        assignedEngineerId: true,
      },
    })

    console.log(`報告遅延チェック: ${overdueProjects.length}件の遅延案件を検出`)

    // 各遅延案件に対して通知を作成
    let notificationCount = 0
    for (const project of overdueProjects) {
      if (project.assignedEngineerId) {
        // 今日の日付で同じ案件の遅延通知が既に存在するかチェック
        const existingNotification = await prisma.notification.findFirst({
          where: {
            projectId: project.id,
            type: 'REPORT_OVERDUE',
            createdAt: {
              gte: today,
            },
          },
        })

        // 今日まだ通知していない場合のみ通知を作成
        if (!existingNotification) {
          await notifyReportOverdue(
            project.id,
            project.projectNumber,
            project.assignedEngineerId
          )
          notificationCount++
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `報告遅延チェック完了: ${overdueProjects.length}件の遅延案件を検出、${notificationCount}件の通知を作成`,
      overdueCount: overdueProjects.length,
      notificationCount,
      checkedAt: jstNow.toISOString(),
    })
  } catch (error) {
    console.error('報告遅延チェックエラー:', error)
    return NextResponse.json(
      {
        error: '報告遅延チェックに失敗しました',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
