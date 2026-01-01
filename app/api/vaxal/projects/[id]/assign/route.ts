import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { notifyProjectAssigned } from '@/lib/notifications'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session || session.user.role !== 'VAXAL_ADMIN') {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 })
    }

    const { id } = await params

    // プロジェクトと主要情報を取得
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        mainInfo: true,
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: 'プロジェクトが見つかりません' },
        { status: 404 }
      )
    }

    // 必須項目チェック
    const mainInfo = project.mainInfo
    const missingFields: string[] = []

    // 元請け情報
    if (!mainInfo?.contractorName) missingFields.push('元請け担当者名')
    if (!mainInfo?.contractorPhone) missingFields.push('元請け電話番号')

    // VAXAL担当者情報
    if (!mainInfo?.receptionStaff) missingFields.push('受付担当者')
    if (!mainInfo?.salesStaff) missingFields.push('営業担当者')
    if (!mainInfo?.constructionStaff) missingFields.push('工務担当者')

    // 建築情報（基本情報のbuildingTypeもチェック）
    if (!mainInfo?.buildingType && !project.buildingType) missingFields.push('建物区分')
    if (!mainInfo?.installationFloor) missingFields.push('設置階数')

    // 商品情報
    if (!mainInfo?.productCategory) missingFields.push('機種区分')
    if (!mainInfo?.productSeries) missingFields.push('シリーズ名')

    // 配送情報
    if (!mainInfo?.deliveryTime) missingFields.push('配送時間')
    if (!mainInfo?.deliverySpecification) missingFields.push('配送指定')

    // 施工情報
    if (!mainInfo?.constructionDate) missingFields.push('施工日')
    if (!mainInfo?.constructionCompany) missingFields.push('施工会社')

    // エンジニア割り振り
    if (!project.assignedEngineerId) missingFields.push('担当エンジニア')

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: '必須項目が未入力です',
          missingFields,
        },
        { status: 400 }
      )
    }

    // ステータスを「注文依頼」に更新
    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        status: 'ASSIGNED',
      },
    })

    // エンジニアに通知を送信
    if (project.assignedEngineerId) {
      await notifyProjectAssigned(id, project.projectNumber, project.assignedEngineerId)
    }

    return NextResponse.redirect(new URL(`/vaxal/project/${id}`, request.url))
  } catch (error) {
    console.error('案件割り振り確定エラー:', error)
    return NextResponse.json(
      { error: '案件割り振り確定に失敗しました' },
      { status: 500 }
    )
  }
}
