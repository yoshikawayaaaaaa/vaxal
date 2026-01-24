import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { deleteFromR2, extractKeyFromUrl } from '@/lib/r2'

// 画像アップロード
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session || session.user.userType !== 'vaxal') {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { category, fileUrls } = body

    if (!category || !fileUrls || fileUrls.length === 0) {
      return NextResponse.json(
        { error: 'カテゴリとファイルURLが必要です' },
        { status: 400 }
      )
    }

    // プロジェクトの確認
    const project = await prisma.project.findUnique({
      where: { id: parseInt(id) },
    })

    if (!project) {
      return NextResponse.json(
        { error: 'プロジェクトが見つかりません' },
        { status: 404 }
      )
    }

    // ファイルURLをデータベースに保存
    const uploadedFiles = []

    for (const fileUrl of fileUrls) {
      // URLからファイル名を抽出
      const fileName = fileUrl.split('/').pop() || 'unknown'

      // データベースに記録
      const projectFile = await prisma.projectFile.create({
        data: {
          projectId: parseInt(id),
          fileName: fileName,
          fileUrl: fileUrl,
          fileSize: 0, // クライアント側でアップロード済みのためサイズ不明
          mimeType: 'image/webp', // 圧縮後はwebp形式
          category: category as any,
        },
      })

      uploadedFiles.push(projectFile)
    }

    return NextResponse.json({
      message: 'アップロードが完了しました',
      files: uploadedFiles,
    })
  } catch (error) {
    console.error('ファイルアップロードエラー:', error)
    return NextResponse.json(
      { error: 'ファイルのアップロードに失敗しました' },
      { status: 500 }
    )
  }
}

// 画像削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session || session.user.userType !== 'vaxal') {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('fileId')

    if (!fileId) {
      return NextResponse.json(
        { error: 'ファイルIDが必要です' },
        { status: 400 }
      )
    }

    // ファイル情報を取得
    const file = await prisma.projectFile.findUnique({
      where: { id: parseInt(fileId) },
    })

    if (!file) {
      return NextResponse.json(
        { error: 'ファイルが見つかりません' },
        { status: 404 }
      )
    }

    // R2から削除
    const key = extractKeyFromUrl(file.fileUrl)
    await deleteFromR2(key)

    // データベースから削除
    await prisma.projectFile.delete({
      where: { id: parseInt(fileId) },
    })

    return NextResponse.json({
      message: 'ファイルを削除しました',
    })
  } catch (error) {
    console.error('ファイル削除エラー:', error)
    return NextResponse.json(
      { error: 'ファイルの削除に失敗しました' },
      { status: 500 }
    )
  }
}
