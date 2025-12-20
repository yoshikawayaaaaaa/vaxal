import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'name' | 'address' | 'phone'
    const query = searchParams.get('query')

    if (!type || !query) {
      return NextResponse.json(
        { error: '検索パラメータが不足しています' },
        { status: 400 }
      )
    }

    // 検索条件を構築
    let whereCondition: any = {}

    switch (type) {
      case 'name':
        whereCondition = {
          customerName: {
            contains: query,
          },
        }
        break
      case 'address':
        whereCondition = {
          OR: [
            {
              customerAddress: {
                contains: query,
              },
            },
            {
              siteAddress: {
                contains: query,
              },
            },
          ],
        }
        break
      case 'phone':
        // 電話番号はハイフンなしでも検索できるように
        const phoneQuery = query.replace(/[-\s]/g, '')
        whereCondition = {
          customerPhone: {
            contains: phoneQuery,
          },
        }
        break
      default:
        return NextResponse.json(
          { error: '無効な検索タイプです' },
          { status: 400 }
        )
    }

    // 案件を検索
    const projects = await prisma.project.findMany({
      where: whereCondition,
      select: {
        id: true,
        projectNumber: true,
        siteName: true,
        siteAddress: true,
        customerName: true,
        customerAddress: true,
        customerPhone: true,
        workContent: true,
        workDate: true,
        status: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      projects,
      total: projects.length,
    })
  } catch (error) {
    console.error('顧客検索エラー:', error)
    return NextResponse.json(
      { error: '検索に失敗しました' },
      { status: 500 }
    )
  }
}
