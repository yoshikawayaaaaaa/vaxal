import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EngineerCalendar } from '@/components/calendar/engineer-calendar'
import { startOfDayJSTinUTC, endOfDayJSTinUTC } from '@/lib/date-utils'

export default async function EngineerCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>
}) {
  const session = await auth()

  if (!session) {
    redirect('/login?type=engineer')
  }

  if (session.user.userType !== 'engineer') {
    redirect('/dashboard')
  }

  const params = await searchParams
  const monthParam = params.month

  // マスターの場合は自社の全スタッフ、スタッフの場合は自分のみ
  const isMaster = session.user.role === 'ENGINEER_MASTER'
  
  // 自分の会社IDを取得
  const currentUser = await prisma.engineerUser.findUnique({
    where: { id: parseInt(session.user.id) },
    select: {
      companyId: true,
      masterCompanyId: true,
    },
  })

  const companyId = currentUser?.masterCompanyId || currentUser?.companyId

  // カレンダーイベントの取得条件
  // マスター・スタッフ共に自分の予定のみ表示
  const calendarWhere = {
    engineerUserId: parseInt(session.user.id),
  }

  // 選択月または当月の開始日と終了日を計算
  let monthStartLocal: Date
  let monthEndLocal: Date

  if (monthParam) {
    // URLパラメータから年月を取得
    const [year, month] = monthParam.split('-').map(Number)
    monthStartLocal = new Date(year, month - 1, 1)
    monthEndLocal = new Date(year, month, 0)
  } else {
    // パラメータがない場合は当月
    const now = new Date()
    monthStartLocal = new Date(now.getFullYear(), now.getMonth(), 1)
    monthEndLocal = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  }

  // UTC変換（統計計算用）
  const monthStart = startOfDayJSTinUTC(monthStartLocal)
  const monthEnd = endOfDayJSTinUTC(monthEndLocal)

  // エンジニアの出勤可能日を取得
  const availableDates = await prisma.calendarEvent.findMany({
    where: {
      ...calendarWhere,
      eventType: 'AVAILABLE',
    },
    include: {
      engineerUser: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      startDate: 'asc',
    },
  })

  // 確定予定（割り振られた案件）を取得
  const confirmedEvents = await prisma.calendarEvent.findMany({
    where: {
      ...calendarWhere,
      eventType: 'CONFIRMED',
    },
    include: {
      engineerUser: {
        select: {
          id: true,
          name: true,
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
  })

  // 当月の統計を計算
  const monthlyAvailableDates = availableDates.filter(date => {
    const startDate = new Date(date.startDate)
    return startDate >= monthStart && startDate <= monthEnd
  })

  const monthlyConfirmedEvents = confirmedEvents.filter(event => {
    const startDate = new Date(event.startDate)
    return startDate >= monthStart && startDate <= monthEnd
  })

  // ステータス別の件数を集計
  const stats = {
    available: monthlyAvailableDates.length,
    assigned: monthlyConfirmedEvents.filter(e => e.project?.status === 'ASSIGNED').length,
    reported: monthlyConfirmedEvents.filter(e => e.project?.status === 'REPORTED').length,
    remainingWork: monthlyConfirmedEvents.filter(e => e.project?.status === 'REMAINING_WORK').length,
    completed: monthlyConfirmedEvents.filter(e => e.project?.status === 'COMPLETED').length,
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">カレンダー</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">出勤可能日の登録と確定予定の確認</p>
        </div>

        {/* 当月の統計 */}
        <div className="mb-4 md:mb-6 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <Card>
            <CardHeader className="pb-2 md:pb-3">
              <CardTitle className="text-xs md:text-sm font-medium text-gray-600">注文依頼</CardTitle>
            </CardHeader>
            <CardContent className="pb-3 md:pb-6">
              <div className="flex items-baseline gap-1 md:gap-2">
                <span className="text-xl md:text-3xl font-bold">{stats.assigned}</span>
                <span className="text-xs md:text-sm text-gray-500">件</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 md:pb-3">
              <CardTitle className="text-xs md:text-sm font-medium text-gray-600">報告済み</CardTitle>
            </CardHeader>
            <CardContent className="pb-3 md:pb-6">
              <div className="flex items-baseline gap-1 md:gap-2">
                <span className="text-xl md:text-3xl font-bold">{stats.reported}</span>
                <span className="text-xs md:text-sm text-gray-500">件</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 md:pb-3">
              <CardTitle className="text-xs md:text-sm font-medium text-gray-600">残工事あり</CardTitle>
            </CardHeader>
            <CardContent className="pb-3 md:pb-6">
              <div className="flex items-baseline gap-1 md:gap-2">
                <span className="text-xl md:text-3xl font-bold">{stats.remainingWork}</span>
                <span className="text-xs md:text-sm text-gray-500">件</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 md:pb-3">
              <CardTitle className="text-xs md:text-sm font-medium text-gray-600">完了</CardTitle>
            </CardHeader>
            <CardContent className="pb-3 md:pb-6">
              <div className="flex items-baseline gap-1 md:gap-2">
                <span className="text-xl md:text-3xl font-bold">{stats.completed}</span>
                <span className="text-xs md:text-sm text-gray-500">件</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ステータスと使い方（スマホのみ表示） */}
        <div className="md:hidden mb-4">
          <details className="group">
            <summary className="cursor-pointer list-none">
              <Card>
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-base">ステータス・使い方</CardTitle>
                  <svg 
                    className="w-4 h-4 text-gray-500 transition-transform group-open:rotate-180" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </CardHeader>
              </Card>
            </summary>
            <Card className="mt-2">
              <CardContent className="pt-4 space-y-3">
                {/* ステータス */}
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2">ステータス</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded flex-shrink-0"></div>
                      <span className="text-xs">対応可能日</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gray-500 rounded flex-shrink-0"></div>
                      <div className="flex flex-col">
                        <span className="text-xs">割り振り前</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded flex-shrink-0"></div>
                      <span className="text-xs">注文依頼</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-purple-500 rounded flex-shrink-0"></div>
                      <span className="text-xs">報告済み</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-500 rounded flex-shrink-0"></div>
                      <span className="text-xs">残工事あり</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded flex-shrink-0"></div>
                      <span className="text-xs">完了</span>
                    </div>
                  </div>
                </div>

                {/* 使い方 */}
                <div className="border-t pt-3">
                  <p className="text-xs font-semibold text-gray-700 mb-2">使い方</p>
                  <div className="space-y-2">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                      <p className="text-xs font-medium text-blue-900 mb-1">📅 出勤可能日の登録</p>
                      <p className="text-xs text-blue-700">日付をクリックして登録</p>
                    </div>
                    
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                      <p className="text-xs font-medium text-yellow-900 mb-1">✅ 登録済みの日付</p>
                      <p className="text-xs text-yellow-700">イベントをクリックで削除</p>
                    </div>
                    
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-2">
                      <p className="text-xs font-medium text-purple-900 mb-1">🔵 確定予定</p>
                      <p className="text-xs text-purple-700">クリックで案件詳細を確認</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </details>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* カレンダー */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="pt-6">
                <EngineerCalendar
                  availableDates={availableDates}
                  confirmedEvents={confirmedEvents}
                />
              </CardContent>
            </Card>
          </div>

          {/* サイドバー（PCのみ表示） */}
          <div className="space-y-6 hidden lg:block">
            <details className="group" open>
              <summary className="cursor-pointer list-none">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>ステータス・使い方</CardTitle>
                    <svg 
                      className="w-5 h-5 text-gray-500 transition-transform group-open:rotate-180" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </CardHeader>
                </Card>
              </summary>
              <Card className="mt-2">
                <CardContent className="pt-6 space-y-4">
                  {/* ステータス */}
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-3">ステータス</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-yellow-500 rounded flex-shrink-0"></div>
                        <span className="text-sm">対応可能日</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-gray-500 rounded flex-shrink-0"></div>
                        <div className="flex flex-col">
                          <span className="text-sm">割り振り前</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-blue-500 rounded flex-shrink-0"></div>
                        <span className="text-sm">注文依頼</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-purple-500 rounded flex-shrink-0"></div>
                        <span className="text-sm">報告済み</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-orange-500 rounded flex-shrink-0"></div>
                        <span className="text-sm">残工事あり</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-green-500 rounded flex-shrink-0"></div>
                        <span className="text-sm">完了</span>
                      </div>
                    </div>
                  </div>

                  {/* 使い方 */}
                  <div className="border-t pt-4">
                    <p className="text-sm font-semibold text-gray-700 mb-3">使い方</p>
                    <div className="space-y-3">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm font-medium text-blue-900 mb-2">📅 出勤可能日の登録</p>
                        <p className="text-sm text-blue-700">
                          カレンダーの日付をクリックすると確認ダイアログが表示されます。「OK」を押すと出勤可能日として登録されます。
                        </p>
                      </div>
                      
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm font-medium text-yellow-900 mb-2">✅ 登録済みの日付</p>
                        <p className="text-sm text-yellow-700">
                          黄色で表示されます。イベントをクリックすると削除確認ダイアログが表示されます。
                        </p>
                      </div>
                      
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                        <p className="text-sm font-medium text-purple-900 mb-2">🔵 確定予定</p>
                        <p className="text-sm text-purple-700">
                          VAXAL社員が案件を割り振ると青色で表示されます。クリックすると案件詳細が確認できます。
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </details>
          </div>
        </div>
      </div>
    </div>
  )
}
