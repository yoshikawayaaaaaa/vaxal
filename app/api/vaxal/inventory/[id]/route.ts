import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
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

    // VAXAL社員のみアクセス可能
    if (session.user.role !== 'VAXAL_ADMIN') {
      return NextResponse.json(
        { error: '権限がありません' },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { productName, manufacturer, partNumber, unitPrice, unitType, currentStock, threshold } = body

    // 在庫を更新
    const updatedItem = await prisma.inventoryItem.update({
      where: { id },
      data: {
        productName: productName || null,
        manufacturer: manufacturer || null,
        partNumber: partNumber || null,
        unitPrice: parseInt(unitPrice),
        unitType: unitType || 'PIECE',
        currentStock: parseInt(currentStock),
        threshold: parseInt(threshold),
      },
    })

    return NextResponse.json(updatedItem)
  } catch (error) {
    console.error('在庫更新エラー:', error)
    return NextResponse.json(
      { error: '在庫の更新に失敗しました' },
      { status: 500 }
    )
  }
}
