import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const staffRegisterSchema = z.object({
  // 個人情報
  name: z.string().min(1, '氏名は必須です'),
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(6, 'パスワードは6文字以上である必要があります'),
  phoneNumber: z.string().min(1, '電話番号は必須です'),
  address: z.string().min(1, '住所は必須です'),
  birthDate: z.string().optional(),
  bloodType: z.enum(['A', 'B', 'O', 'AB', 'UNKNOWN']).optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  emergencyContact: z.string().optional(),
  hasQualification: z.boolean(),
  hasLicense: z.boolean().optional(),
  hasWorkersComp: z.boolean().optional(),
  availableServices: z.string().optional(),
})

// スタッフアカウント作成（マスターアカウント専用）
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    // エンジニアのマスターアカウントのみアクセス可能
    if (session.user.role !== 'ENGINEER_MASTER') {
      return NextResponse.json(
        { error: 'マスターアカウントのみがスタッフを追加できます' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // バリデーション
    const validatedData = staffRegisterSchema.parse(body)

    // メールアドレスの重複チェック
    const existingEngineer = await prisma.engineerUser.findUnique({
      where: { email: validatedData.email },
    })

    if (existingEngineer) {
      return NextResponse.json(
        { error: 'このメールアドレスは既に登録されています' },
        { status: 400 }
      )
    }

    // マスターアカウントの会社IDを取得
    const masterUser = await prisma.engineerUser.findUnique({
      where: { id: parseInt(session.user.id) },
      select: { masterCompanyId: true },
    })

    if (!masterUser?.masterCompanyId) {
      return NextResponse.json(
        { error: 'マスターアカウントに会社が紐付いていません' },
        { status: 400 }
      )
    }

    // パスワードをハッシュ化
    const hashedPassword = await bcrypt.hash(validatedData.password, 10)

    // スタッフアカウントを作成
    const staff = await prisma.engineerUser.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        role: 'STAFF',
        name: validatedData.name,
        phoneNumber: validatedData.phoneNumber,
        address: validatedData.address,
        birthDate: validatedData.birthDate ? new Date(validatedData.birthDate) : undefined,
        bloodType: validatedData.bloodType,
        gender: validatedData.gender,
        emergencyContact: validatedData.emergencyContact,
        hasQualification: validatedData.hasQualification,
        hasLicense: validatedData.hasLicense,
        hasWorkersComp: validatedData.hasWorkersComp,
        availableServices: validatedData.availableServices,
        companyId: masterUser.masterCompanyId, // マスターの会社に紐付け
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

    return NextResponse.json(
      {
        message: 'スタッフアカウントを作成しました',
        staff,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('スタッフ登録エラー:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'スタッフの登録に失敗しました' },
      { status: 500 }
    )
  }
}

// スタッフ一覧取得（マスターアカウント専用）
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    // エンジニアのマスターアカウントのみアクセス可能
    if (session.user.role !== 'ENGINEER_MASTER') {
      return NextResponse.json(
        { error: 'マスターアカウントのみがスタッフ一覧を閲覧できます' },
        { status: 403 }
      )
    }

    // マスターアカウントの会社IDを取得
    const masterUser = await prisma.engineerUser.findUnique({
      where: { id: parseInt(session.user.id) },
      select: { masterCompanyId: true },
    })

    if (!masterUser?.masterCompanyId) {
      return NextResponse.json(
        { error: 'マスターアカウントに会社が紐付いていません' },
        { status: 400 }
      )
    }

    // 自社のスタッフ一覧を取得
    const staffList = await prisma.engineerUser.findMany({
      where: {
        companyId: masterUser.masterCompanyId,
        role: 'STAFF',
      },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        address: true,
        birthDate: true,
        bloodType: true,
        gender: true,
        emergencyContact: true,
        hasQualification: true,
        hasLicense: true,
        hasWorkersComp: true,
        availableServices: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      staffList,
      total: staffList.length,
    })
  } catch (error) {
    console.error('スタッフ一覧取得エラー:', error)
    return NextResponse.json(
      { error: 'スタッフ一覧の取得に失敗しました' },
      { status: 500 }
    )
  }
}
