import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { CalendarView } from '@/components/calendar/calendar-view'
import { CompanyFilter } from '@/components/calendar/company-filter'
import { MonthFilter } from '@/components/calendar/month-filter'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/constants'
import { startOfDayJSTinUTC, endOfDayJSTinUTC } from '@/lib/date-utils'

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; company?: string }>
}) {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  // VAXAL社員のみアクセス可能
  if (session.user.role !== 'VAXAL_ADMIN') {
    redirect('/engineer')
  }

  // 表示月と会社フィルターを取得
  const params = await searchParams
  const currentDate = params.month ? new Date(params.month) : new Date()
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const companyFilter = params.company
  
  // 月の開始日と終了日を計算（ローカル日付）
  const monthStartLocal = new Date(year, month, 1)
  const monthEndLocal = new Date(year, month + 1, 0)
  
  // UTC変換（データベースクエリ用）
  const monthStart = startOfDayJSTinUTC(monthStartLocal)
  const monthEnd = endOfDayJSTinUTC(monthEndLocal)

  // 会社フィルター条件を構築
  const companyWhere = companyFilter
    ? {
        engineerUser: {
          OR: [
            { companyId: parseInt(companyFilter) },
            { masterCompanyId: parseInt(companyFilter) },
          ],
        },
      }
    : {}

  // 並列クエリ実行で高速化
  const [companiesData, statusCounts, confirmedEvents] = await Promise.all([
    // エンジニア会社一覧を取得
    prisma.company.findMany({
      select: {
        id: true,
        companyName: true,
      },
      orderBy: {
        companyName: 'asc',
      },
    }),
    
    // 当月のステータス別案件数を取得（会社フィルター適用）
    prisma.project.groupBy({
      by: ['status'],
      where: {
        workDate: {
          gte: monthStart,
          lte: monthEnd,
        },
        // 会社フィルターが指定されている場合は、CalendarEventを経由してフィルタリング
        ...(companyFilter
          ? {
              calendarEvents: {
                some: {
                  eventType: 'CONFIRMED',
                  ...companyWhere,
                },
              },
            }
          : {}),
      },
      _count: {
        status: true,
      },
    }),
    
    // 確定予定（割り振られた案件）を取得（最適化版 - N+1問題を解決 + 月の範囲でフィルタリング）
    prisma.calendarEvent.findMany({
      where: {
        eventType: 'CONFIRMED',
        startDate: {
          gte: monthStart,
          lte: monthEnd,
        },
        ...companyWhere,
      },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        engineerUserId: true,
        projectId: true,
        engineerUser: {
          select: {
            id: true,
            name: true,
            companyId: true,
            masterCompanyId: true,
          },
        },
        project: {
          select: {
            id: true,
            projectNumber: true,
            siteName: true,
            siteAddress: true,
            status: true,
          },
        },
      },
      orderBy: {
        startDate: 'asc',
      },
    }),
  ])
  
  const companies = companiesData.map(c => ({
    id: String(c.id),
    companyName: c.companyName,
  }))

  // ステータス別の件数をマップに変換
  const countsByStatus: Record<string, number> = {
    PENDING: 0,
    ASSIGNED: 0,
    REPORTED: 0,
    COMPLETED: 0,
    REMAINING_WORK: 0,
  }

  statusCounts.forEach((item) => {
    countsByStatus[item.status] = item._count.status
  })

  // エンジニアのIDを収集
  const engineerIds = confirmedEvents
    .map(e => e.engineerUser?.id)
    .filter((id): id is number => id !== undefined && id !== null)
  
  const uniqueEngineerIds = [...new Set(engineerIds)]

  // 会社情報を一括取得
  const engineers = uniqueEngineerIds.length > 0 
    ? await prisma.engineerUser.findMany({
        where: {
          id: {
            in: uniqueEngineerIds,
          },
        },
        select: {
          id: true,
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
      })
    : []

  // エンジニアIDから会社情報へのマップを作成
  const engineerCompanyMap = new Map(
    engineers.map(e => [
      e.id,
      {
        company: e.company,
        masterCompany: e.masterCompany,
      },
    ])
  )

  // カレンダーイベント形式に変換
  const events = confirmedEvents.map((event) => {
    const companyInfo = event.engineerUser 
      ? engineerCompanyMap.get(event.engineerUser.id)
      : null
    
    const companyName = companyInfo?.masterCompany?.companyName || companyInfo?.company?.companyName

    return {
      id: String(event.project?.id || event.id),
      title: `${event.engineerUser?.name || '不明'} - ${event.project?.siteName || '確定予定'}`,
      start: new Date(event.startDate),
      end: new Date(event.endDate),
      resource: {
        type: 'CONFIRMED' as const,
        projectNumber: event.project?.projectNumber,
        siteName: event.project?.siteName,
        status: event.project?.status,
        engineerName: event.engineerUser?.name,
        companyName: companyName,
      },
    }
  })

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">カレンダー</h1>
          <p className="text-sm md:text-base text-gray-600 mt-2">
            {year}年{month + 1}月の工事予定を確認できます
          </p>
        </div>

        {/* フィルター */}
        <div className="mb-4 md:mb-6 flex flex-col md:flex-row gap-3 md:gap-4">
          <MonthFilter />
          <CompanyFilter companies={companies} />
        </div>

        {/* ステータス別案件数 */}
        <div className="mb-4 md:mb-6 grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
          {Object.entries(countsByStatus).map(([status, count]) => {
            // URLパラメータを構築（会社フィルターがある場合は追加）
            const queryParams = new URLSearchParams({
              status,
              month: `${year}-${String(month + 1).padStart(2, '0')}`,
            })
            if (companyFilter) {
              queryParams.set('company', companyFilter)
            }
            
            return (
              <Link
                key={status}
                href={`/vaxal/project?${queryParams.toString()}`}
              >
                <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2 md:pb-3">
                    <CardTitle className="text-xs md:text-sm font-medium text-gray-600">
                      {STATUS_LABELS[status]}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline gap-1 md:gap-2">
                      <span className="text-2xl md:text-3xl font-bold">{count}</span>
                      <span className="text-xs md:text-sm text-gray-500">件</span>
                    </div>
                    <div className={`mt-1 md:mt-2 inline-block px-1.5 md:px-2 py-0.5 md:py-1 rounded text-[10px] md:text-xs ${STATUS_COLORS[status]}`}>
                      クリックで一覧表示
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        {/* 使い方の説明 */}
        <div className="mb-4 md:mb-6 p-3 md:p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2 md:gap-3">
            <svg className="w-4 h-4 md:w-5 md:h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="text-xs md:text-sm font-medium text-blue-900 mb-1">カレンダーの使い方</p>
              <ul className="text-xs md:text-sm text-blue-800 space-y-1">
                <li>• <strong>日付をクリック</strong>: その日の案件一覧を表示</li>
                <li>• <strong>案件をクリック</strong>: 案件詳細ページへ移動</li>
              </ul>
            </div>
          </div>
        </div>

        <CalendarView events={events} currentDate={currentDate} companyFilter={companyFilter} />
      </div>
    </div>
  )
}
