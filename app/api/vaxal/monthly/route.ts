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

    return NextResponse.redirect(new URL(`/vaxal/monthly?year=${year}&month=${month}&success=true`, request.url))
  } catch (error) {
    console.error('月次データ保存エラー:', error)
    return NextResponse.json(
      { error: '月次データの保存に失敗しました' },
      { status: 500 }
    )
  }
}
