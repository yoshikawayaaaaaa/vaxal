import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { CalendarView } from '@/components/calendar/calendar-view'

export default async function CalendarPage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  // VAXAL社員のみアクセス可能
  if (session.user.role !== 'VAXAL_ADMIN') {
    redirect('/engineer')
  }

  // 全エンジニアの出勤可能日を取得
  const availableDates = await prisma.calendarEvent.findMany({
    where: {
      eventType: 'AVAILABLE',
    },
    include: {
      engineerUser: {
        select: {
          id: true,
          name: true,
          company: {
            select: {
              companyName: true,
            },
          },
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
      eventType: 'CONFIRMED',
    },
    include: {
      engineerUser: {
        select: {
          id: true,
          name: true,
          company: {
            select: {
              companyName: true,
            },
          },
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

  // カレンダーイベント形式に変換
  // 確定予定がある日は、対応可能日を表示しない
  const confirmedDates = new Set(
    confirmedEvents.map(event => {
      const date = new Date(event.startDate)
      date.setHours(0, 0, 0, 0)
      return date.getTime()
    })
  )

  const events = [
    // 確定予定がない日のみ対応可能日を表示
    ...availableDates
      .filter(date => {
        const dateTime = new Date(date.startDate)
        dateTime.setHours(0, 0, 0, 0)
        return !confirmedDates.has(dateTime.getTime())
      })
      .map((date) => ({
        id: date.id,
        title: `${date.engineerUser?.company?.companyName || '不明'} - ${date.engineerUser?.name || '不明'} - 対応可能`,
        start: new Date(date.startDate),
        end: new Date(date.endDate),
        resource: {
          type: 'AVAILABLE' as const,
          engineerName: date.engineerUser?.name,
          companyName: date.engineerUser?.company?.companyName,
        },
      })),
    // 確定予定は常に表示
    ...confirmedEvents.map((event) => ({
      id: event.project?.id || event.id, // プロジェクトIDを使用（存在しない場合はイベントID）
      title: `${event.engineerUser?.name || '不明'} - ${event.project?.siteName || '確定予定'}`,
      start: new Date(event.startDate),
      end: new Date(event.endDate),
      resource: {
        type: 'CONFIRMED' as const,
        projectNumber: event.project?.projectNumber,
        siteName: event.project?.siteName,
        status: event.project?.status,
        engineerName: event.engineerUser?.name,
        companyName: event.engineerUser?.company?.companyName,
      },
    })),
  ]

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">カレンダー</h1>
          <p className="text-gray-600 mt-2">工事予定を確認できます</p>
        </div>

        {/* 使い方の説明 */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900 mb-1">カレンダーの使い方</p>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>日付をクリック</strong>: その日の案件一覧を表示</li>
                <li>• <strong>案件をクリック</strong>: 案件詳細ページへ移動</li>
              </ul>
            </div>
          </div>
        </div>

        <CalendarView events={events} />
      </div>
    </div>
  )
}
