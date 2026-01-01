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

    // VAXAL社員のみアクセス可能
    if (session.user.role !== 'VAXAL_ADMIN') {
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

export async function POST(request: Request) {
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
    const { name, productName, manufacturer, partNumber, unitPrice, unitType, currentStock, threshold } = body

    // 最大のdisplayOrderを取得
    const maxOrder = await prisma.inventoryItem.findFirst({
      orderBy: {
        displayOrder: 'desc',
      },
      select: {
        displayOrder: true,
      },
    })

    const newUnitPrice = parseInt(unitPrice)
    const now = new Date()

    // 新しい部材を追加
    const newItem = await prisma.inventoryItem.create({
      data: {
        name,
        productName: productName || null,
        manufacturer: manufacturer || null,
        partNumber: partNumber || null,
        unitPrice: newUnitPrice,
        unitType: unitType || 'PIECE',
        currentStock: parseInt(currentStock),
        threshold: parseInt(threshold),
        displayOrder: (maxOrder?.displayOrder || 0) + 1,
      },
    })

    // 初期単価の履歴を作成
    await prisma.inventoryPriceHistory.create({
      data: {
        inventoryItemId: newItem.id,
        price: newUnitPrice,
        effectiveFrom: now,
        effectiveTo: null, // 現在有効
      },
    })

    return NextResponse.json(newItem)
  } catch (error) {
    console.error('在庫追加エラー:', error)
    return NextResponse.json(
      { error: '在庫の追加に失敗しました' },
      { status: 500 }
    )
  }
}
