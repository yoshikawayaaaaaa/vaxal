import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const registerSchema = z.object({
  name: z.string().min(1, '氏名は必須です'),
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(6, 'パスワードは6文字以上である必要があります'),
  phoneNumber: z.string().min(1, '電話番号は必須です'),
  accountType: z.enum(['STAFF', 'CALL_CENTER']).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // バリデーション
    const validatedData = registerSchema.parse(body)

    // メールアドレスの重複チェック
    const existingUser = await prisma.vaxalUser.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'このメールアドレスは既に登録されています' },
        { status: 400 }
      )
    }

    // パスワードをハッシュ化
    const hashedPassword = await bcrypt.hash(validatedData.password, 10)

    // ユーザーを作成
    const user = await prisma.vaxalUser.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        phoneNumber: validatedData.phoneNumber,
        accountType: validatedData.accountType || 'STAFF',
      },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        accountType: true,
        createdAt: true,
      },
    })

    return NextResponse.json(
      { 
        message: '登録が完了しました',
        user 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('登録エラー:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: '登録に失敗しました' },
      { status: 500 }
    )
  }
}
