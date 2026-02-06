import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

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

    // VAXAL社員のみアクセス可能
    if (session.user.role !== 'VAXAL_ADMIN') {
      return NextResponse.json(
        { error: '権限がありません' },
        { status: 403 }
      )
    }

    const { id } = await params

    // 在庫アイテムが存在するか確認
    const item = await prisma.inventoryItem.findUnique({
      where: { id: parseInt(id) },
      include: {
        pickupMaterials: true
      }
    })

    if (!item) {
      return NextResponse.json(
        { error: '在庫アイテムが見つかりません' },
        { status: 404 }
      )
    }

    // PickupMaterialで使用されている場合は削除不可
    if (item.pickupMaterials.length > 0) {
      return NextResponse.json(
        { error: 'この部材は報告書で使用されているため削除できません' },
        { status: 400 }
      )
    }

    // 在庫アイテムを削除（関連する単価履歴も自動削除される）
    await prisma.inventoryItem.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({ message: '削除しました' })
  } catch (error) {
    console.error('在庫削除エラー:', error)
    return NextResponse.json(
      { error: '在庫の削除に失敗しました' },
      { status: 500 }
    )
  }
}

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

    // 現在の在庫アイテムを取得
    const currentItem = await prisma.inventoryItem.findUnique({
      where: { id: parseInt(id) }
    })

    if (!currentItem) {
      return NextResponse.json(
        { error: '在庫アイテムが見つかりません' },
        { status: 404 }
      )
    }

    const newUnitPrice = parseInt(unitPrice)
    const now = new Date()

    // 単価が変更された場合、履歴を記録
    if (currentItem.unitPrice !== newUnitPrice) {
      // 現在有効な履歴の終了日を設定
      await prisma.inventoryPriceHistory.updateMany({
        where: {
          inventoryItemId: parseInt(id),
          effectiveTo: null, // 現在有効な履歴
        },
        data: {
          effectiveTo: now,
        },
      })

      // 新しい単価の履歴を作成
      await prisma.inventoryPriceHistory.create({
        data: {
          inventoryItemId: parseInt(id),
          price: newUnitPrice,
          effectiveFrom: now,
          effectiveTo: null, // 現在有効
        },
      })
    }

    // 在庫を更新
    const updatedItem = await prisma.inventoryItem.update({
      where: { id: parseInt(id) },
      data: {
        productName: productName || null,
        manufacturer: manufacturer || null,
        partNumber: partNumber || null,
        unitPrice: newUnitPrice,
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
