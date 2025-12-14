import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
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

    const { id } = await params

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        mainInfo: true,
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: '案件が見つかりません' },
        { status: 404 }
      )
    }

    // エンジニアは自分に割り当てられた案件のみ閲覧可能
    if (
      session.user.role !== 'VAXAL_ADMIN' &&
      project.assignedEngineerId !== session.user.id
    ) {
      return NextResponse.json(
        { error: 'アクセス権限がありません' },
        { status: 403 }
      )
    }

    // MainInfoが存在しない場合、Projectの施工指示を初期値として返す
    if (!project.mainInfo) {
      return NextResponse.json({
        constructionNotes: project.constructionNotes,
      })
    }

    return NextResponse.json(project.mainInfo)
  } catch (error) {
    console.error('主要情報取得エラー:', error)
    return NextResponse.json(
      { error: '主要情報の取得に失敗しました' },
      { status: 500 }
    )
  }
}

export async function POST(
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

    const { id } = await params
    const body = await request.json()

    const project = await prisma.project.findUnique({
      where: { id },
    })

    if (!project) {
      return NextResponse.json(
        { error: '案件が見つかりません' },
        { status: 404 }
      )
    }

    // エンジニアは自分に割り当てられた案件のみ編集可能
    if (
      session.user.role !== 'VAXAL_ADMIN' &&
      project.assignedEngineerId !== session.user.id
    ) {
      return NextResponse.json(
        { error: 'アクセス権限がありません' },
        { status: 403 }
      )
    }

    // 日付フィールドの変換
    const dateFields = [
      'roofingDate',
      'demolitionDate',
      'deliveryDate',
      'shipmentDate',
      'surveyRequestDate',
      'surveyDate',
      'reSurveyDate',
      'constructionDate',
      'remainingWorkDate',
    ]

    const data: any = { ...body }
    
    // 空文字列のフィールドを削除
    Object.keys(data).forEach((key) => {
      if (data[key] === '') {
        delete data[key]
      }
    })
    
    // 日付フィールドの変換
    dateFields.forEach((field) => {
      if (data[field]) {
        data[field] = new Date(data[field])
      }
    })

    // 主要情報を作成または更新
    const mainInfo = await prisma.mainInfo.upsert({
      where: {
        projectId: id,
      },
      create: {
        projectId: id,
        projectNumber: project.projectNumber,
        ...data,
      },
      update: data,
    })

    return NextResponse.json(mainInfo)
  } catch (error) {
    console.error('主要情報保存エラー:', error)
    return NextResponse.json(
      { error: '主要情報の保存に失敗しました' },
      { status: 500 }
    )
  }
}
