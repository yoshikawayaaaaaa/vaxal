import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const engineerRegisterSchema = z.object({
  // 個人情報
  name: z.string().min(1, '氏名は必須です'),
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(6, 'パスワードは6文字以上である必要があります'),
  phoneNumber: z.string().min(1, '電話番号は必須です'),
  address: z.string().min(1, '住所は必須です'),
  birthDate: z.string().optional(),
  bloodType: z.enum(['A', 'B', 'O', 'AB', 'UNKNOWN']).optional(),
  hasQualification: z.boolean(),
  availableServices: z.string().optional(),
  
  // 会社情報
  company: z.object({
    companyName: z.string().min(1, '会社名は必須です'),
    address: z.string().min(1, '所在地は必須です'),
    representativeName: z.string().min(1, '代表者名は必須です'),
    phoneNumber: z.string().min(1, '会社電話番号は必須です'),
    email: z.string().email('有効な会社メールアドレスを入力してください'),
  }),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // バリデーション
    const validatedData = engineerRegisterSchema.parse(body)

    // メールアドレスの重複チェック（個人）
    const existingEngineer = await prisma.engineerUser.findUnique({
      where: { email: validatedData.email },
    })

    if (existingEngineer) {
      return NextResponse.json(
        { error: 'このメールアドレスは既に登録されています' },
        { status: 400 }
      )
    }

    // メールアドレスの重複チェック（会社）
    const existingCompany = await prisma.company.findUnique({
      where: { email: validatedData.company.email },
    })

    if (existingCompany) {
      return NextResponse.json(
        { error: 'この会社メールアドレスは既に登録されています' },
        { status: 400 }
      )
    }

    // パスワードをハッシュ化
    const hashedPassword = await bcrypt.hash(validatedData.password, 10)

    // 業者番号を生成（ランダムな8桁の数字）
    const companyNumber = Math.floor(10000000 + Math.random() * 90000000).toString()

    // トランザクションで会社とエンジニアを同時に作成
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 会社を作成
      const company = await tx.company.create({
        data: {
          companyNumber,
          companyName: validatedData.company.companyName,
          address: validatedData.company.address,
          representativeName: validatedData.company.representativeName,
          phoneNumber: validatedData.company.phoneNumber,
          email: validatedData.company.email,
        },
      })

      // エンジニア（マスター）を作成
      const engineer = await tx.engineerUser.create({
        data: {
          email: validatedData.email,
          password: hashedPassword,
          role: 'MASTER',
          name: validatedData.name,
          phoneNumber: validatedData.phoneNumber,
          address: validatedData.address,
          birthDate: validatedData.birthDate ? new Date(validatedData.birthDate) : undefined,
          bloodType: validatedData.bloodType,
          hasQualification: validatedData.hasQualification,
          availableServices: validatedData.availableServices,
          masterCompanyId: company.id, // マスターとして会社に紐付け
        },
        select: {
          id: true,
          name: true,
          email: true,
          phoneNumber: true,
          role: true,
          createdAt: true,
        },
      })

      return { company, engineer }
    })

    return NextResponse.json(
      {
        message: '登録が完了しました',
        engineer: result.engineer,
        company: {
          id: result.company.id,
          companyName: result.company.companyName,
          companyNumber: result.company.companyNumber,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('エンジニア登録エラー:', error)

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
