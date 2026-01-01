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
    type?: 'AVAILABLE' | 'CONFIRMED'
    // エンジニア情報
    engineerName?: string
    companyName?: string
    // 案件情報（確定予定の場合）
    projectNumber?: string
    workContent?: string
    workType?: string
    siteAddress?: string
    status?: string
    siteName?: string
  }
}

interface CalendarViewProps {
  events: CalendarEvent[]
}

export function CalendarView({ events }: CalendarViewProps) {
  const router = useRouter()

  const handleSelectEvent = (event: CalendarEvent) => {
    // 確定予定の場合は案件詳細へ
    if (event.resource.type === 'CONFIRMED') {
      router.push(`/vaxal/project/${event.id}`)
    }
  }

  const handleSelectSlot = ({ start }: { start: Date }) => {
    // 日付を選択した場合、その日の案件一覧ページへ
    // タイムゾーンのずれを防ぐため、ローカル日付を使用
    const year = start.getFullYear()
    const month = String(start.getMonth() + 1).padStart(2, '0')
    const day = String(start.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`
    router.push(`/vaxal/calendar/${dateStr}`)
  }

  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = '#3b82f6' // デフォルト: 青

    // 確定予定の場合はステータスに応じて色を変更
    switch (event.resource.status) {
      case 'PENDING':
        backgroundColor = '#eab308' // 黄色（注文仮登録）
        break
      case 'ASSIGNED':
        backgroundColor = '#3b82f6' // 青色（注文依頼）
        break
      case 'REPORTED':
        backgroundColor = '#a855f7' // 紫色（報告済み）
        break
      case 'COMPLETED':
        backgroundColor = '#22c55e' // 緑色（完了）
        break
      case 'REMAINING_WORK':
        backgroundColor = '#f97316' // オレンジ色（残工事あり）
        break
      default:
        backgroundColor = '#6b7280' // グレー（その他）
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
        onSelectSlot={handleSelectSlot}
        eventPropGetter={eventStyleGetter}
        messages={messages}
        culture="ja"
        views={['month', 'week', 'day', 'agenda']}
        defaultView="month"
        toolbar={true}
        popup={true}
        selectable={true}
      />
    </div>
  )
}
