import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// 出勤可能日の削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    // エンジニアのみ削除可能
    if (session.user.userType !== 'engineer') {
      return NextResponse.json(
        { error: '権限がありません' },
        { status: 403 }
      )
    }

    const { id } = await params

    // イベントを取得して所有者確認
    const event = await prisma.calendarEvent.findUnique({
      where: { id: parseInt(id) },
    })

    if (!event) {
      return NextResponse.json(
        { error: 'イベントが見つかりません' },
        { status: 404 }
      )
    }

    // 自分のイベントかどうか確認
    if (event.engineerUserId !== parseInt(session.user.id)) {
      return NextResponse.json(
        { error: '権限がありません' },
        { status: 403 }
      )
    }

    // 確定予定（割り振られた案件）は削除できない
    if (event.eventType === 'CONFIRMED') {
      return NextResponse.json(
        { error: '確定予定は削除できません' },
        { status: 400 }
      )
    }

    // 削除実行
    await prisma.calendarEvent.delete({
      where: { id: parseInt(id) },
    })

    return NextResponse.json({ message: '削除しました' })
  } catch (error) {
    console.error('出勤可能日削除エラー:', error)
    return NextResponse.json(
      { error: '出勤可能日の削除に失敗しました' },
      { status: 500 }
    )
  }
}
