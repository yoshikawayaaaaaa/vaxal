import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { notifyProjectCompleted } from '@/lib/notifications'

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

    // プロジェクトを取得
    const project = await prisma.project.findUnique({
      where: { id },
    })

    if (!project) {
      return NextResponse.json(
        { error: 'プロジェクトが見つかりません' },
        { status: 404 }
      )
    }

    // ステータスチェック（REPORTEDまたはREMAINING_WORKのみ完了可能）
    if (project.status !== 'REPORTED' && project.status !== 'REMAINING_WORK') {
      return NextResponse.json(
        { error: 'このステータスでは完了できません' },
        { status: 400 }
      )
    }

    // ステータスをCOMPLETEDに更新
    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completionDate: new Date(),
      },
    })

    // エンジニアに通知を送信
    if (project.assignedEngineerId) {
      await notifyProjectCompleted(id, project.projectNumber, project.assignedEngineerId)
    }

    // リダイレクトを返す
    return NextResponse.redirect(new URL(`/vaxal/project/${id}/related`, request.url))
  } catch (error) {
    console.error('案件完了エラー:', error)
    return NextResponse.json(
      { error: '案件の完了に失敗しました' },
      { status: 500 }
    )
  }
}
