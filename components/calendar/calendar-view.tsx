'use client'

import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { ja } from 'date-fns/locale'
import { useRouter } from 'next/navigation'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const locales = {
  ja: ja,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  resource: {
    projectNumber: string
    workContent: string
    workType: string
    siteAddress: string
    status: string
  }
}

interface CalendarViewProps {
  events: CalendarEvent[]
}

export function CalendarView({ events }: CalendarViewProps) {
  const router = useRouter()

  const handleSelectEvent = (event: CalendarEvent) => {
    router.push(`/vaxal/project/${event.id}`)
  }

  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = '#3b82f6' // デフォルト: 青

    // ステータスに応じて色を変更
    switch (event.resource.status) {
      case 'PENDING':
        backgroundColor = '#eab308' // 黄色
        break
      case 'IN_PROGRESS':
        backgroundColor = '#3b82f6' // 青
        break
      case 'COMPLETED':
        backgroundColor = '#22c55e' // 緑
        break
      case 'CANCELLED':
        backgroundColor = '#ef4444' // 赤
        break
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    }
  }

  const messages = {
    allDay: '終日',
    previous: '前',
    next: '次',
    today: '今日',
    month: '月',
    week: '週',
    day: '日',
    agenda: '予定',
    date: '日付',
    time: '時間',
    event: 'イベント',
    noEventsInRange: 'この期間にイベントはありません',
    showMore: (total: number) => `+${total} 件`,
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6" style={{ height: '700px' }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        onSelectEvent={handleSelectEvent}
        eventPropGetter={eventStyleGetter}
        messages={messages}
        culture="ja"
        views={['month', 'week', 'day', 'agenda']}
        defaultView="month"
        toolbar={true}
        popup={true}
      />
    </div>
  )
}
