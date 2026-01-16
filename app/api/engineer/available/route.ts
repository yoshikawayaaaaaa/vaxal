import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { startOfDayJSTinUTC, endOfDayJSTinUTC } from '@/lib/date-utils'

// 指定日に出勤可能なエンジニアを取得
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
    const dateParam = searchParams.get('date')

    if (!dateParam) {
      return NextResponse.json(
        { error: '日付が指定されていません' },
        { status: 400 }
      )
    }

    // JST日付をUTCに変換
    const startDate = startOfDayJSTinUTC(dateParam)
    const endDate = endOfDayJSTinUTC(dateParam)

    // 指定日に出勤可能として登録されているエンジニアを取得
    const availableEvents = await prisma.calendarEvent.findMany({
      where: {
        eventType: 'AVAILABLE',
        startDate: {
          lte: endDate,
        },
        endDate: {
          gte: startDate,
        },
      },
      include: {
        engineerUser: {
          select: {
            id: true,
            name: true,
            email: true,
            companyId: true,
            masterCompanyId: true,
            company: {
              select: {
                id: true,
                companyName: true,
              },
            },
            masterCompany: {
              select: {
                id: true,
                companyName: true,
              },
            },
          },
        },
      },
    })

    // 指定日に既に割り振られている案件をエンジニアごとに取得
    const assignedProjects = await prisma.project.findMany({
      where: {
        workDate: {
          gte: startDate,
          lte: endDate,
        },
        assignedEngineerId: {
          not: null,
        },
      },
      select: {
        id: true,
        projectNumber: true,
        siteName: true,
        siteAddress: true,
        workContent: true,
        assignedEngineerId: true,
      },
    })

    // エンジニアごとの案件情報を整理
    const projectsByEngineer = assignedProjects.reduce((acc, project) => {
      const engineerId = project.assignedEngineerId!
      if (!acc[engineerId]) {
        acc[engineerId] = []
      }
      acc[engineerId].push({
        id: project.id,
        projectNumber: project.projectNumber,
        siteName: project.siteName,
        siteAddress: project.siteAddress,
        workContent: project.workContent,
      })
      return acc
    }, {} as Record<string, any[]>)

    // エンジニア情報を整形（MAX5案件まで）
    const MAX_PROJECTS_PER_DAY = 5
    
    const workContentLabels: Record<string, string> = {
      ECO_CUTE: 'エコキュート',
      GAS_WATER_HEATER: 'ガス給湯器',
      ELECTRIC_HEATER: '電気温水器',
      BATHROOM_DRYER: '浴室乾燥機',
      SOLAR_PANEL: '太陽光パネル',
      OTHER: 'その他',
    }
    
    const availableEngineers = availableEvents
      .filter(event => event.engineerUser)
      .map(event => {
        const engineer = event.engineerUser!
        const company = engineer.masterCompany || engineer.company
        const assignedProjects = projectsByEngineer[engineer.id] || []
        const assignedCount = assignedProjects.length
        
        return {
          id: String(engineer.id),
          name: engineer.name,
          email: engineer.email,
          companyId: company?.id ? String(company.id) : undefined,
          companyName: company?.companyName,
          assignedCount,
          remainingSlots: MAX_PROJECTS_PER_DAY - assignedCount,
          assignedProjects: assignedProjects.map(p => ({
            ...p,
            workContentLabel: workContentLabels[p.workContent] || p.workContent,
          })),
        }
      })
      // 重複を除去
      .filter((engineer, index, self) => 
        index === self.findIndex(e => e.id === engineer.id)
      )
      // MAX5案件未満のエンジニアのみ表示
      .filter(engineer => engineer.assignedCount < MAX_PROJECTS_PER_DAY)

    // 会社ごとにグループ化
    const groupedByCompany = availableEngineers.reduce((acc, engineer) => {
      const companyId = engineer.companyId || 'unknown'
      if (!acc[companyId]) {
        acc[companyId] = {
          companyId,
          companyName: engineer.companyName || '不明',
          engineers: [],
        }
      }
      acc[companyId].engineers.push(engineer)
      return acc
    }, {} as Record<string, { companyId: string; companyName: string; engineers: any[] }>)

    return NextResponse.json({
      date: dateParam,
      companies: Object.values(groupedByCompany),
      totalEngineers: availableEngineers.length,
    })
  } catch (error) {
    console.error('出勤可能エンジニア取得エラー:', error)
    return NextResponse.json(
      { error: '出勤可能エンジニアの取得に失敗しました' },
      { status: 500 }
    )
  }
}
