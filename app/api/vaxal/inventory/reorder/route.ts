import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    // VAXAL社員のみアクセス可能
    if (session.user.role !== 'VAXAL_ADMIN') {
      return NextResponse.json(
        { error: '権限がありません' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { id, direction } = body // direction: 'up' or 'down'

    const currentItem = await prisma.inventoryItem.findUnique({
      where: { id: parseInt(id) }
    })

    if (!currentItem) {
      return NextResponse.json(
        { error: '在庫アイテムが見つかりません' },
        { status: 404 }
      )
    }

    if (direction === 'up') {
      // 上に移動：現在のdisplayOrderより小さい最大のdisplayOrderを持つアイテムと入れ替え
      const targetItem = await prisma.inventoryItem.findFirst({
        where: {
          displayOrder: {
            lt: currentItem.displayOrder
          }
        },
        orderBy: {
          displayOrder: 'desc'
        }
      })

      if (targetItem) {
        // displayOrderを入れ替え
        await prisma.$transaction([
          prisma.inventoryItem.update({
            where: { id: currentItem.id },
            data: { displayOrder: targetItem.displayOrder }
          }),
          prisma.inventoryItem.update({
            where: { id: targetItem.id },
            data: { displayOrder: currentItem.displayOrder }
          })
        ])
      }
    } else if (direction === 'down') {
      // 下に移動：現在のdisplayOrderより大きい最小のdisplayOrderを持つアイテムと入れ替え
      const targetItem = await prisma.inventoryItem.findFirst({
        where: {
          displayOrder: {
            gt: currentItem.displayOrder
          }
        },
        orderBy: {
          displayOrder: 'asc'
        }
      })

      if (targetItem) {
        // displayOrderを入れ替え
        await prisma.$transaction([
          prisma.inventoryItem.update({
            where: { id: currentItem.id },
            data: { displayOrder: targetItem.displayOrder }
          }),
          prisma.inventoryItem.update({
            where: { id: targetItem.id },
            data: { displayOrder: currentItem.displayOrder }
          })
        ])
      }
    }

    return NextResponse.json({ message: '並び替えしました' })
  } catch (error) {
    console.error('並び替えエラー:', error)
    return NextResponse.json(
      { error: '並び替えに失敗しました' },
      { status: 500 }
    )
  }
}
