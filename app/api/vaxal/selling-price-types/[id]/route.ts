import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// 売価タイプ更新
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== 'VAXAL_ADMIN') {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, displayOrder, isActive } = body

    const sellingPriceType = await prisma.sellingPriceType.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(displayOrder !== undefined && { displayOrder }),
        ...(isActive !== undefined && { isActive }),
      }
    })

    return NextResponse.json(sellingPriceType)
  } catch (error) {
    console.error('売価タイプ更新エラー:', error)
    return NextResponse.json(
      { error: '売価タイプの更新に失敗しました' },
      { status: 500 }
    )
  }
}

// 売価タイプ削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== 'VAXAL_ADMIN') {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    await prisma.sellingPriceType.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('売価タイプ削除エラー:', error)
    return NextResponse.json(
      { error: '売価タイプの削除に失敗しました' },
      { status: 500 }
    )
  }
}
