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
  const events = [
    ...availableDates.map((date) => ({
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

        <CalendarView events={events} />
      </div>
    </div>
  )
}
