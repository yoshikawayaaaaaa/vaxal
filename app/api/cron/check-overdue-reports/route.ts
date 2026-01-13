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
    const jstNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }))
    
    // 昨日の日付（JST）を取得
    const yesterdayJST = new Date(jstNow)
    yesterdayJST.setDate(yesterdayJST.getDate() - 1)
    yesterdayJST.setHours(0, 0, 0, 0)
    
    // 昨日の0時（JST）をUTCに変換
    const yesterdayUTC = new Date(yesterdayJST.getTime() - 9 * 60 * 60 * 1000)

    // 工事日が昨日で、ステータスがASSIGNED（報告未提出）の案件を取得
    const overdueProjects = await prisma.project.findMany({
      where: {
        workDate: {
          gte: yesterdayUTC, // 昨日の0時以降
          lt: new Date(yesterdayUTC.getTime() + 24 * 60 * 60 * 1000), // 昨日の23:59:59まで
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

    // 各遅延案件に対して通知を作成（重複チェックなし、昨日の工事日のみが対象なので）
    let notificationCount = 0
    for (const project of overdueProjects) {
      if (project.assignedEngineerId) {
        await notifyReportOverdue(
          project.id,
          project.projectNumber,
          project.assignedEngineerId
        )
        notificationCount++
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
