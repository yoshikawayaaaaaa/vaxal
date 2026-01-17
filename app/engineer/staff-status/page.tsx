import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns'
import { ja } from 'date-fns/locale'
import Link from 'next/link'
import { startOfDayJSTinUTC, endOfDayJSTinUTC } from '@/lib/date-utils'

export default async function StaffStatusPage({
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

  // マスターのみアクセス可能
  const isMaster = session.user.role === 'ENGINEER_MASTER'
  
  if (!isMaster) {
    redirect('/engineer/calendar')
  }

  // 自分の会社IDを取得
  const currentUser = await prisma.engineerUser.findUnique({
    where: { id: parseInt(session.user.id) },
    select: {
      companyId: true,
      masterCompanyId: true,
    },
  })

  const companyId = currentUser?.masterCompanyId || currentUser?.companyId

  if (!companyId) {
    redirect('/engineer/calendar')
  }

  const params = await searchParams
  const monthParam = params.month

  // 選択月または当月の開始日と終了日を計算
  let monthStart: Date
  let monthEnd: Date
  let targetMonth: Date

  if (monthParam) {
    // URLパラメータから年月を取得
    const [year, month] = monthParam.split('-').map(Number)
    targetMonth = new Date(year, month - 1, 1)
    monthStart = new Date(year, month - 1, 1)
    monthEnd = new Date(year, month, 0, 23, 59, 59, 999)
  } else {
    // パラメータがない場合は当月
    const now = new Date()
    targetMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
  }

  // 月の全日付を取得
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // 自社の全スタッフを取得
  const allStaff = await prisma.engineerUser.findMany({
    where: {
      OR: [
        { companyId },
        { masterCompanyId: companyId },
      ],
    },
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: 'asc',
    },
  })

  // 月全体のカレンダーイベントを取得
  const calendarWhere = {
    engineerUser: {
      OR: [
        { companyId },
        { masterCompanyId: companyId },
      ],
    },
    startDate: {
      gte: monthStart,
      lte: monthEnd,
    },
  }

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
          status: true,
        },
      },
    },
  })

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
  })

  // 日付ごとのスタッフ状況を集計
  const dailyStatus = daysInMonth.map((day) => {
    const dayStart = startOfDayJSTinUTC(day)
    const dayEnd = endOfDayJSTinUTC(day)
    
    const dayConfirmed = confirmedEvents.filter((e) => {
      const eventDate = new Date(e.startDate)
      return eventDate >= dayStart && eventDate <= dayEnd
    })
    const dayAvailable = availableDates.filter((d) => {
      const eventDate = new Date(d.startDate)
      return eventDate >= dayStart && eventDate <= dayEnd
    })

    const busyStaffIds = new Set([
      ...dayConfirmed.map((e) => e.engineerUser?.id).filter(Boolean),
      ...dayAvailable.map((d) => d.engineerUser?.id).filter(Boolean),
    ])

    const unregistered = allStaff.filter((staff) => !busyStaffIds.has(staff.id))

    return {
      date: day,
      confirmed: dayConfirmed,
      available: dayAvailable,
      unregistered,
    }
  })

  // ステータスの色を取得
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'ASSIGNED':
        return 'bg-blue-500'
      case 'REPORTED':
        return 'bg-purple-500'
      case 'COMPLETED':
        return 'bg-green-500'
      case 'REMAINING_WORK':
        return 'bg-orange-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'PENDING':
        return '割り振り前'
      case 'ASSIGNED':
        return '注文依頼'
      case 'REPORTED':
        return '報告済み'
      case 'COMPLETED':
        return '完了'
      case 'REMAINING_WORK':
        return '残工事あり'
      default:
        return '不明'
    }
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">スタッフ状況</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">
            {format(targetMonth, 'yyyy年M月', { locale: ja })}の日別スタッフ状況
          </p>
        </div>

        {/* 月選択 */}
        <div className="mb-6 flex items-center gap-4">
          <Link
            href={`/engineer/staff-status?month=${format(
              new Date(targetMonth.getFullYear(), targetMonth.getMonth() - 1, 1),
              'yyyy-MM'
            )}`}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium"
          >
            ← 前月
          </Link>
          <span className="text-lg font-semibold">
            {format(targetMonth, 'yyyy年M月', { locale: ja })}
          </span>
          <Link
            href={`/engineer/staff-status?month=${format(
              new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 1),
              'yyyy-MM'
            )}`}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium"
          >
            次月 →
          </Link>
        </div>

        {/* 日別状況一覧 */}
        <div className="space-y-4">
          {dailyStatus.map(({ date, confirmed, available, unregistered }) => (
            <Card key={date.toISOString()}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base md:text-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <span className="whitespace-nowrap">📅 {format(date, 'M月d日(E)', { locale: ja })}</span>
                    <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-normal text-gray-600 flex-wrap">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded whitespace-nowrap">
                        確定: {confirmed.length}件
                      </span>
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded whitespace-nowrap">
                        対応可能: {available.length}件
                      </span>
                      <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded whitespace-nowrap">
                        未登録: {unregistered.length}件
                      </span>
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* 確定予定 */}
                  <div>
                    <h3 className="font-semibold text-sm mb-2 text-gray-700">✅ 現場一覧</h3>
                    {confirmed.length > 0 ? (
                      <div className="space-y-2">
                        {confirmed.map((event) => (
                          <Link
                            key={event.id}
                            href={event.project ? `/engineer/project/${event.project.id}` : '#'}
                            className="block bg-white border border-gray-200 rounded p-2 hover:border-blue-400 transition-all text-sm"
                          >
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="font-medium truncate">
                                👤 {event.engineerUser?.name || '未割当'}
                              </span>
                              <span
                                className={`text-xs px-2 py-0.5 rounded text-white ${getStatusColor(
                                  event.project?.status
                                )}`}
                              >
                                {getStatusLabel(event.project?.status)}
                              </span>
                            </div>
                            {event.project && (
                              <p className="text-xs text-gray-600 truncate">
                                📍 {event.project.siteName}
                              </p>
                            )}
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400">なし</p>
                    )}
                  </div>

                  {/* 対応可能 */}
                  <div>
                    <h3 className="font-semibold text-sm mb-2 text-gray-700">🟡 対応可能</h3>
                    {available.length > 0 ? (
                      <div className="space-y-2">
                        {available.map((date) => (
                          <div
                            key={date.id}
                            className="bg-yellow-50 border border-yellow-200 rounded p-2 text-sm"
                          >
                            <span className="font-medium">
                              👤 {date.engineerUser?.name || '不明'}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400">なし</p>
                    )}
                  </div>

                  {/* 未登録 */}
                  <div>
                    <h3 className="font-semibold text-sm mb-2 text-gray-700">⚪ 未登録</h3>
                    {unregistered.length > 0 ? (
                      <div className="space-y-2">
                        {unregistered.map((staff) => (
                          <div
                            key={staff.id}
                            className="bg-gray-50 border border-gray-200 rounded p-2 text-sm"
                          >
                            <span className="font-medium">👤 {staff.name}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400">なし</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
