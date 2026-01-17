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
  currentDate?: Date
  companyFilter?: string
}

export function CalendarView({ events, currentDate, companyFilter }: CalendarViewProps) {
  const router = useRouter()
  
  // カスタムツールバーコンポーネント
  const CustomToolbar = ({ date }: { date: Date }) => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    
    return (
      <div className="rbc-toolbar mb-4">
        <span className="rbc-toolbar-label text-xl font-bold">
          {year}年{month}月
        </span>
      </div>
    )
  }

  const handleSelectEvent = (event: CalendarEvent) => {
    console.log('Event clicked:', event)
    // 確定予定の場合は案件詳細へ
    if (event.resource.type === 'CONFIRMED') {
      router.push(`/vaxal/project/${event.id}`)
    }
  }

  const handleSelectSlot = ({ start, action }: { start: Date; action: string }) => {
    console.log('Slot selected:', start, 'action:', action)
    
    // 日付を選択した場合、その日の案件一覧ページへ
    // タイムゾーンのずれを防ぐため、ローカル日付を使用
    const year = start.getFullYear()
    const month = String(start.getMonth() + 1).padStart(2, '0')
    const day = String(start.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`
    
    // 会社フィルターがある場合はURLパラメータに追加
    const url = companyFilter 
      ? `/vaxal/calendar/${dateStr}?company=${companyFilter}`
      : `/vaxal/calendar/${dateStr}`
    
    console.log('Navigating to:', url)
    router.push(url)
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
      {currentDate && <CustomToolbar date={currentDate} />}
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
        onDrillDown={(date) => {
          console.log('DrillDown triggered:', date)
          const year = date.getFullYear()
          const month = String(date.getMonth() + 1).padStart(2, '0')
          const day = String(date.getDate()).padStart(2, '0')
          const dateStr = `${year}-${month}-${day}`
          
          // 会社フィルターがある場合はURLパラメータに追加
          const url = companyFilter 
            ? `/vaxal/calendar/${dateStr}?company=${companyFilter}`
            : `/vaxal/calendar/${dateStr}`
          
          router.push(url)
        }}
        eventPropGetter={eventStyleGetter}
        messages={messages}
        culture="ja"
        views={['month']}
        defaultView="month"
        date={currentDate}
        toolbar={false}
        popup={true}
        selectable={true}
        longPressThreshold={10}
        drilldownView={null}
      />
      <style jsx global>{`
        @media (max-width: 768px) {
          .rbc-calendar {
            font-size: 11px;
          }
          .rbc-header {
            padding: 4px 2px;
            font-size: 11px;
            font-weight: 600;
          }
          .rbc-date-cell {
            padding: 6px;
            font-size: 14px;
            user-select: none;
            -webkit-user-select: none;
          }
          .rbc-date-cell button {
            cursor: default;
            pointer-events: none;
          }
          .rbc-event {
            padding: 1px 3px;
            font-size: 9px;
            line-height: 1.2;
            pointer-events: auto;
            touch-action: manipulation;
            position: relative;
            z-index: 10;
          }
          .rbc-event-content {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .rbc-month-view {
            border: 1px solid #ddd;
          }
          .rbc-day-bg {
            min-height: 60px;
            cursor: pointer;
            touch-action: manipulation;
            -webkit-tap-highlight-color: rgba(59, 130, 246, 0.3);
            user-select: none;
            -webkit-user-select: none;
            position: relative;
          }
          .rbc-day-bg:active {
            background-color: rgba(59, 130, 246, 0.1);
          }
          .rbc-month-row {
            touch-action: manipulation;
          }
          .rbc-show-more {
            font-size: 9px;
            padding: 1px 2px;
            cursor: pointer;
            touch-action: manipulation;
          }
        }
        @media (min-width: 769px) {
          .rbc-day-bg {
            min-height: 100px;
          }
        }
      `}</style>
    </div>
  )
}
