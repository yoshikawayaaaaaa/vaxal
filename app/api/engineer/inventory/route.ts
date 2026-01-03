import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    // エンジニアのみアクセス可能
    if (session.user.userType !== 'engineer') {
      return NextResponse.json(
        { error: '権限がありません' },
        { status: 403 }
      )
    }

    // 在庫一覧を取得
    const items = await prisma.inventoryItem.findMany({
      orderBy: {
        displayOrder: 'asc',
      },
    })

    return NextResponse.json({
      items,
      total: items.length,
    })
  } catch (error) {
    console.error('在庫取得エラー:', error)
    return NextResponse.json(
      { error: '在庫の取得に失敗しました' },
      { status: 500 }
    )
  }
}
