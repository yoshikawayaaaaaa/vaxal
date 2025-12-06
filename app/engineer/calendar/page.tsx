import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EngineerCalendar } from '@/components/calendar/engineer-calendar'

export default async function EngineerCalendarPage() {
  const session = await auth()

  if (!session) {
    redirect('/login?type=engineer')
  }

  if (session.user.userType !== 'engineer') {
    redirect('/dashboard')
  }

  // マスターの場合は自社の全スタッフ、スタッフの場合は自分のみ
  const isMaster = session.user.role === 'ENGINEER_MASTER'
  
  // 自分の会社IDを取得
  const currentUser = await prisma.engineerUser.findUnique({
    where: { id: session.user.id },
    select: {
      companyId: true,
      masterCompanyId: true,
    },
  })

  const companyId = currentUser?.masterCompanyId || currentUser?.companyId

  // カレンダーイベントの取得条件
  const calendarWhere = isMaster && companyId
    ? {
        // マスター：自社の全スタッフの予定
        engineerUser: {
          OR: [
            { companyId },
            { masterCompanyId: companyId },
          ],
        },
      }
    : {
        // スタッフ：自分の予定のみ
        engineerUserId: session.user.id,
      }

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
        },
      },
    },
    orderBy: {
      startDate: 'asc',
    },
  })

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">カレンダー</h1>
          <p className="text-gray-600 mt-2">出勤可能日の登録と確定予定の確認</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* カレンダー */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>カレンダー</CardTitle>
              </CardHeader>
              <CardContent>
                <EngineerCalendar
                  availableDates={availableDates}
                  confirmedEvents={confirmedEvents}
                />
              </CardContent>
            </Card>
          </div>

          {/* サイドバー */}
          <div className="space-y-6">
            {/* 凡例 */}
            <Card>
              <CardHeader>
                <CardTitle>凡例</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-sm">対応可能日</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span className="text-sm">確定予定（割り振られた案件）</span>
                </div>
              </CardContent>
            </Card>

            {/* 確定予定一覧 */}
            <Card>
              <CardHeader>
                <CardTitle>確定予定</CardTitle>
              </CardHeader>
              <CardContent>
                {confirmedEvents.length > 0 ? (
                  <div className="space-y-3">
                    {confirmedEvents.map((event) => (
                      <div
                        key={event.id}
                        className="p-3 bg-blue-50 rounded-lg border border-blue-200"
                      >
                        <p className="font-medium text-sm">
                          {event.project?.projectNumber}
                        </p>
                        <p className="text-sm text-gray-600">
                          {event.project?.siteName}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(event.startDate).toLocaleDateString('ja-JP')}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">
                    確定予定はありません
                  </p>
                )}
              </CardContent>
            </Card>

            {/* 使い方 */}
            <Card>
              <CardHeader>
                <CardTitle>使い方</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-blue-900 mb-2">📅 出勤可能日の登録</p>
                  <p className="text-sm text-blue-700">
                    カレンダーの日付をクリックすると確認ダイアログが表示されます。「OK」を押すと出勤可能日として登録されます。
                  </p>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-green-900 mb-2">✅ 登録済みの日付</p>
                  <p className="text-sm text-green-700">
                    緑色で表示されます。再度クリックすると削除確認ダイアログが表示されます。
                  </p>
                </div>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-purple-900 mb-2">🔵 確定予定</p>
                  <p className="text-sm text-purple-700">
                    VAXAL社員が案件を割り振ると青色で表示されます。クリックすると案件詳細が確認できます。
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
