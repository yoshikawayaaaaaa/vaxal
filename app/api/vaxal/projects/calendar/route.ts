import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    // 工事日が設定されている案件のみ取得
    const projects = await prisma.project.findMany({
      where: {
        workDate: {
          not: null,
        },
      },
      select: {
        id: true,
        projectNumber: true,
        siteName: true,
        customerName: true,
        workDate: true,
        workContent: true,
        workType: true,
        siteAddress: true,
        status: true,
      },
      orderBy: {
        workDate: 'asc',
      },
    })

    // カレンダーイベント形式に変換
    const events = projects.map(project => ({
      id: project.id,
      title: `${project.siteName} - ${project.customerName}`,
      start: project.workDate,
      end: project.workDate,
      resource: {
        projectNumber: project.projectNumber,
        workContent: project.workContent,
        workType: project.workType,
        siteAddress: project.siteAddress,
        status: project.status,
      },
    }))

    return NextResponse.json(events)
  } catch (error) {
    console.error('カレンダーデータ取得エラー:', error)
    return NextResponse.json(
      { error: 'カレンダーデータの取得に失敗しました' },
      { status: 500 }
    )
  }
}
