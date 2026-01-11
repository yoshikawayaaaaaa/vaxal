import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { startOfDay, endOfDay } from 'date-fns'

// 出勤可能日の登録
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    // エンジニアのみ登録可能
    if (session.user.userType !== 'engineer') {
      return NextResponse.json(
        { error: '権限がありません' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { date } = body

    if (!date) {
      return NextResponse.json(
        { error: '日付が指定されていません' },
        { status: 400 }
      )
    }

    const selectedDate = new Date(date)
    const startDate = startOfDay(selectedDate)
    const endDate = endOfDay(selectedDate)

    // 既に同じ日に登録されているか確認（対応可能日または確定予定）
    const existingEvent = await prisma.calendarEvent.findFirst({
      where: {
        engineerUserId: parseInt(session.user.id),
        startDate: {
          gte: startDate,
          lt: endDate,
        },
      },
    })

    if (existingEvent) {
      return NextResponse.json(
        { error: 'この日は既に登録されています' },
        { status: 400 }
      )
    }

    // 出勤可能日を登録
    const calendarEvent = await prisma.calendarEvent.create({
      data: {
        title: '対応可能',
        startDate,
        endDate,
        eventType: 'AVAILABLE',
        engineerUserId: parseInt(session.user.id),
      },
    })

    return NextResponse.json(calendarEvent, { status: 201 })
  } catch (error) {
    console.error('出勤可能日登録エラー:', error)
    return NextResponse.json(
      { error: '出勤可能日の登録に失敗しました' },
      { status: 500 }
    )
  }
}

// 出勤可能日の一覧取得
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    // エンジニアのみ取得可能
    if (session.user.userType !== 'engineer') {
      return NextResponse.json(
        { error: '権限がありません' },
        { status: 403 }
      )
    }

    const events = await prisma.calendarEvent.findMany({
      where: {
        engineerUserId: parseInt(session.user.id),
      },
      orderBy: {
        startDate: 'asc',
      },
    })

    return NextResponse.json(events)
  } catch (error) {
    console.error('出勤可能日取得エラー:', error)
    return NextResponse.json(
      { error: '出勤可能日の取得に失敗しました' },
      { status: 500 }
    )
  }
}
