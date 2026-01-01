import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// 売価タイプ一覧取得
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== 'VAXAL_ADMIN') {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const sellingPriceTypes = await prisma.sellingPriceType.findMany({
      orderBy: {
        displayOrder: 'asc'
      }
    })

    return NextResponse.json(sellingPriceTypes)
  } catch (error) {
    console.error('売価タイプ取得エラー:', error)
    return NextResponse.json(
      { error: '売価タイプの取得に失敗しました' },
      { status: 500 }
    )
  }
}

// 売価タイプ作成
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== 'VAXAL_ADMIN') {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, displayOrder } = body

    if (!name) {
      return NextResponse.json(
        { error: '売価タイプ名は必須です' },
        { status: 400 }
      )
    }

    // 同じ名前が既に存在するかチェック
    const existing = await prisma.sellingPriceType.findUnique({
      where: { name }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'この売価タイプ名は既に存在します' },
        { status: 400 }
      )
    }

    const sellingPriceType = await prisma.sellingPriceType.create({
      data: {
        name,
        displayOrder: displayOrder || 0,
        isActive: true
      }
    })

    return NextResponse.json(sellingPriceType)
  } catch (error) {
    console.error('売価タイプ作成エラー:', error)
    return NextResponse.json(
      { error: '売価タイプの作成に失敗しました' },
      { status: 500 }
    )
  }
}
