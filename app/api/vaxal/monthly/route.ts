import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const year = parseInt(searchParams.get('year') || '')
    const month = parseInt(searchParams.get('month') || '')

    if (!year || !month) {
      return NextResponse.json(
        { error: '年月が指定されていません' },
        { status: 400 }
      )
    }

    // 月次データを取得
    const monthlyExpense = await prisma.monthlyExpense.findUnique({
      where: {
        year_month: {
          year,
          month,
        },
      },
    })

    // カスタム項目を別途取得
    let customItems: any[] = []
    if (monthlyExpense && prisma.monthlyExpenseCustomItem) {
      customItems = await prisma.monthlyExpenseCustomItem.findMany({
        where: {
          monthlyExpenseId: monthlyExpense.id,
        },
        orderBy: {
          displayOrder: 'asc',
        },
      })
    }

    return NextResponse.json({
      monthlyExpense: monthlyExpense || null,
      customItems: customItems,
    })
  } catch (error) {
    console.error('月次データ取得エラー:', error)
    return NextResponse.json(
      { error: '月次データの取得に失敗しました' },
      { status: 500 }
    )
  }
}

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

    const formData = await request.formData()
    const year = parseInt(formData.get('year') as string)
    const month = parseInt(formData.get('month') as string)

    const data = {
      wasteDisposalFee: formData.get('wasteDisposalFee') ? parseInt(formData.get('wasteDisposalFee') as string) : null,
      vehicleFee: formData.get('vehicleFee') ? parseInt(formData.get('vehicleFee') as string) : null,
      laborCost: formData.get('laborCost') ? parseInt(formData.get('laborCost') as string) : null,
      warehouseFee: formData.get('warehouseFee') ? parseInt(formData.get('warehouseFee') as string) : null,
      officeFee: formData.get('officeFee') ? parseInt(formData.get('officeFee') as string) : null,
      communicationFee: formData.get('communicationFee') ? parseInt(formData.get('communicationFee') as string) : null,
    }

    // カスタム項目の取得
    const customItemsJson = formData.get('customItems')
    const customItems = customItemsJson ? JSON.parse(customItemsJson as string) : []

    console.log('カスタム項目データ:', customItems)

    // 月次データを作成または更新
    const monthlyExpense = await prisma.monthlyExpense.upsert({
      where: {
        year_month: {
          year,
          month,
        },
      },
      create: {
        year,
        month,
        ...data,
      },
      update: data,
    })

    console.log('月次データID:', monthlyExpense.id)

    // 既存のカスタム項目を削除
    try {
      // @ts-ignore - 本番環境でPrisma Clientが更新されるまでの一時的な対応
      if (prisma.monthlyExpenseCustomItem) {
        // @ts-ignore
        await prisma.monthlyExpenseCustomItem.deleteMany({
          where: {
            monthlyExpenseId: monthlyExpense.id,
          },
        })
        console.log('既存カスタム項目を削除しました')

        // 新しいカスタム項目を作成
        if (customItems.length > 0) {
          // @ts-ignore
          const result = await prisma.monthlyExpenseCustomItem.createMany({
            data: customItems.map((item: { itemName: string; amount: number }, index: number) => ({
              monthlyExpenseId: monthlyExpense.id,
              itemName: item.itemName,
              amount: parseInt(item.amount.toString()),
              displayOrder: index,
            })),
          })
          console.log('カスタム項目を作成しました:', result)
        }
      } else {
        console.log('monthlyExpenseCustomItemモデルが見つかりません')
      }
    } catch (error) {
      console.error('カスタム項目の保存エラー:', error)
    }

    return NextResponse.redirect(new URL(`/vaxal/monthly?year=${year}&month=${month}&success=true`, request.url))
  } catch (error) {
    console.error('月次データ保存エラー:', error)
    return NextResponse.json(
      { error: '月次データの保存に失敗しました' },
      { status: 500 }
    )
  }
}
