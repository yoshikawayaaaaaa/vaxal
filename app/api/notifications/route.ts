import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// 通知一覧を取得
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    // ユーザータイプに応じて通知を取得
    const where =
      session.user.userType === 'vaxal'
        ? { vaxalUserId: parseInt(session.user.id) }
        : { engineerUserId: parseInt(session.user.id) }

    const notifications = await prisma.notification.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            projectNumber: true,
            siteName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // createdAtとupdatedAtを9時間引いてUTCに戻してからISO文字列として返す
    const serializedNotifications = notifications.map(notification => {
      const createdAtUTC = new Date(notification.createdAt.getTime() - 9 * 60 * 60 * 1000)
      const updatedAtUTC = new Date(notification.updatedAt.getTime() - 9 * 60 * 60 * 1000)
      
      return {
        ...notification,
        createdAt: createdAtUTC.toISOString(),
        updatedAt: updatedAtUTC.toISOString(),
      }
    })

    return NextResponse.json(serializedNotifications)
  } catch (error) {
    console.error('通知取得エラー:', error)
    return NextResponse.json(
      { error: '通知の取得に失敗しました' },
      { status: 500 }
    )
  }
}

// 通知を既読にする
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const body = await request.json()
    const { notificationId } = body

    if (!notificationId) {
      return NextResponse.json(
        { error: '通知IDが必要です' },
        { status: 400 }
      )
    }

    // notificationIdを数値に変換
    const id = parseInt(notificationId)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: '無効な通知IDです' },
        { status: 400 }
      )
    }

    // 通知を取得して権限チェック
    const notification = await prisma.notification.findUnique({
      where: { id },
    })

    if (!notification) {
      return NextResponse.json(
        { error: '通知が見つかりません' },
        { status: 404 }
      )
    }

    // 自分の通知かチェック
    const isOwner =
      (session.user.userType === 'vaxal' &&
        notification.vaxalUserId === parseInt(session.user.id)) ||
      (session.user.userType === 'engineer' &&
        notification.engineerUserId === parseInt(session.user.id))

    if (!isOwner) {
      return NextResponse.json(
        { error: 'アクセス権限がありません' },
        { status: 403 }
      )
    }

    // 既読にする
    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    })

    return NextResponse.json(updatedNotification)
  } catch (error) {
    console.error('通知既読エラー:', error)
    return NextResponse.json(
      { error: '通知の既読に失敗しました' },
      { status: 500 }
    )
  }
}

// 全ての通知を既読にする
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    // ユーザータイプに応じて通知を既読にする
    const where =
      session.user.userType === 'vaxal'
        ? { vaxalUserId: parseInt(session.user.id), isRead: false }
        : { engineerUserId: parseInt(session.user.id), isRead: false }

    await prisma.notification.updateMany({
      where,
      data: { isRead: true },
    })

    return NextResponse.json({ message: '全ての通知を既読にしました' })
  } catch (error) {
    console.error('通知一括既読エラー:', error)
    return NextResponse.json(
      { error: '通知の一括既読に失敗しました' },
      { status: 500 }
    )
  }
}
