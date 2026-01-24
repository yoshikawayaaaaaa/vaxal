import { auth } from '@/auth'
import { NextRequest, NextResponse } from 'next/server'
import { generatePresignedUrl } from '@/lib/r2'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user.userType !== 'vaxal') {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const body = await request.json()
    const { fileName, contentType } = body

    if (!fileName || !contentType) {
      return NextResponse.json(
        { error: 'ファイル名とコンテンツタイプが必要です' },
        { status: 400 }
      )
    }

    // ファイル名を生成（タイムスタンプ + オリジナル名）
    const timestamp = Date.now()
    const key = `projects/${timestamp}_${fileName}`

    // プリサインドURLを生成
    const { uploadUrl, publicUrl } = await generatePresignedUrl(key, contentType)

    return NextResponse.json({
      uploadUrl,
      publicUrl,
      key,
    })
  } catch (error) {
    console.error('プリサインドURL生成エラー:', error)
    return NextResponse.json(
      { error: 'プリサインドURLの生成に失敗しました' },
      { status: 500 }
    )
  }
}
