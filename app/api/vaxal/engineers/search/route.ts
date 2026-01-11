import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns'

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
    const type = searchParams.get('type') // 'keyword' | 'company'
    const field = searchParams.get('field') // 'name' | 'company' | 'email' | 'address'
    const query = searchParams.get('query')
    const companyId = searchParams.get('companyId')

    let whereCondition: any = {}

    // キーワード検索
    if (type === 'keyword') {
      if (!field || !query) {
        return NextResponse.json(
          { error: '検索パラメータが不足しています' },
          { status: 400 }
        )
      }

      switch (field) {
        case 'name':
          whereCondition.name = {
            contains: query,
          }
          break
        case 'company':
          whereCondition.OR = [
            {
              company: {
                companyName: {
                  contains: query,
                },
              },
            },
            {
              masterCompany: {
                companyName: {
                  contains: query,
                },
              },
            },
          ]
          break
        case 'email':
          whereCondition.email = {
            contains: query,
          }
          break
        case 'address':
          whereCondition.address = {
            contains: query,
          }
          break
        default:
          return NextResponse.json(
            { error: '無効な検索フィールドです' },
            { status: 400 }
          )
      }
    }
    // 会社別検索
    else if (type === 'company') {
      if (!companyId) {
        return NextResponse.json(
          { error: '会社IDが指定されていません' },
          { status: 400 }
        )
      }

      whereCondition.OR = [
        { companyId: parseInt(companyId) },
        { masterCompanyId: parseInt(companyId) },
      ]
    } else {
      return NextResponse.json(
        { error: '無効な検索タイプです' },
        { status: 400 }
      )
    }

    // エンジニアを検索
    const engineers = await prisma.engineerUser.findMany({
      where: whereCondition,
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        phoneNumber: true,
        company: {
          select: {
            companyName: true,
          },
        },
        masterCompany: {
          select: {
            companyName: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    // 各エンジニアの月別稼働状況を取得（過去6ヶ月）
    const engineersWithStats = await Promise.all(
      engineers.map(async (engineer: any) => {
        const monthlyStats = []
        
        // 過去6ヶ月分のデータを取得
        for (let i = 0; i < 6; i++) {
          const targetDate = subMonths(new Date(), i)
          const startDate = startOfMonth(targetDate)
          const endDate = endOfMonth(targetDate)

          const projectCount = await prisma.project.count({
            where: {
              assignedEngineerId: engineer.id,
              workDate: {
                gte: startDate,
                lte: endDate,
              },
            },
          })

          monthlyStats.unshift({
            month: format(targetDate, 'yyyy年M月'),
            projectCount,
          })
        }

        // 総案件数を取得
        const totalProjects = await prisma.project.count({
          where: {
            assignedEngineerId: engineer.id,
          },
        })

        return {
          id: engineer.id,
          name: engineer.name,
          email: engineer.email,
          address: engineer.address || '未登録',
          phoneNumber: engineer.phoneNumber || '未登録',
          companyName: engineer.masterCompany?.companyName || engineer.company?.companyName || '不明',
          monthlyStats,
          totalProjects,
        }
      })
    )

    return NextResponse.json({
      engineers: engineersWithStats,
      total: engineersWithStats.length,
    })
  } catch (error) {
    console.error('エンジニア検索エラー:', error)
    return NextResponse.json(
      { error: '検索に失敗しました' },
      { status: 500 }
    )
  }
}
