import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { unlink } from 'fs/promises'

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
    const formData = await request.formData()
    const category = formData.get('category') as string
    const files = formData.getAll('files') as File[]

    if (!category || files.length === 0) {
      return NextResponse.json(
        { error: 'カテゴリとファイルが必要です' },
        { status: 400 }
      )
    }

    // プロジェクトの確認
    const project = await prisma.project.findUnique({
      where: { id },
    })

    if (!project) {
      return NextResponse.json(
        { error: 'プロジェクトが見つかりません' },
        { status: 404 }
      )
    }

    // アップロードディレクトリの作成
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'projects')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // ファイルを保存
    const uploadedFiles = []

    for (const file of files) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // ファイル名を生成（タイムスタンプ + オリジナル名）
      const timestamp = Date.now()
      const fileName = `${timestamp}_${file.name}`
      const filePath = join(uploadDir, fileName)

      // ファイルを保存
      await writeFile(filePath, buffer)

      // データベースに記録
      const projectFile = await prisma.projectFile.create({
        data: {
          projectId: id,
          fileName: file.name,
          fileUrl: `/uploads/projects/${fileName}`,
          fileSize: file.size,
          mimeType: file.type,
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
      where: { id: fileId },
    })

    if (!file) {
      return NextResponse.json(
        { error: 'ファイルが見つかりません' },
        { status: 404 }
      )
    }

    // ファイルシステムから削除
    const filePath = join(process.cwd(), 'public', file.fileUrl)
    if (existsSync(filePath)) {
      await unlink(filePath)
    }

    // データベースから削除
    await prisma.projectFile.delete({
      where: { id: fileId },
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
