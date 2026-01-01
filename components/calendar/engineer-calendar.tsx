'use client'

import { useState } from 'react'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay, startOfDay, endOfDay } from 'date-fns'
import { ja } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { useRouter } from 'next/navigation'

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
  eventType: 'AVAILABLE' | 'CONFIRMED'
  project?: {
    id: string
    projectNumber: string
    siteName: string
    siteAddress: string
    status?: string
  }
}

interface EngineerCalendarProps {
  availableDates: any[]
  confirmedEvents: any[]
}

export function EngineerCalendar({ availableDates, confirmedEvents }: EngineerCalendarProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())

  // データを統合してカレンダーイベント形式に変換
  // 確定予定がある日は、対応可能日を表示しない
  const confirmedDates = new Set(
    confirmedEvents.map(event => 
      startOfDay(new Date(event.startDate)).getTime()
    )
  )

  const events: CalendarEvent[] = [
    // 確定予定がない日のみ対応可能日を表示
    ...availableDates
      .filter(date => !confirmedDates.has(startOfDay(new Date(date.startDate)).getTime()))
      .map((date) => ({
        id: date.id,
        title: date.engineerUser ? `${date.engineerUser.name} - 対応可能` : '対応可能',
        start: new Date(date.startDate),
        end: new Date(date.endDate),
        eventType: 'AVAILABLE' as const,
        engineerUser: date.engineerUser,
      })),
    // 確定予定は常に表示
    ...confirmedEvents.map((event) => ({
      id: event.id,
      title: event.engineerUser 
        ? `${event.engineerUser.name} - ${event.project?.siteName || '確定予定'}`
        : event.project?.siteName || '確定予定',
      start: new Date(event.startDate),
      end: new Date(event.endDate),
      eventType: 'CONFIRMED' as const,
      project: event.project,
      engineerUser: event.engineerUser,
    })),
  ]

  // 日付クリック時の処理（確認ダイアログ付き）
  const handleSelectSlot = async ({ start }: { start: Date }) => {
    if (isLoading) return

    const clickedDate = startOfDay(start)
    const formattedDate = format(clickedDate, 'yyyy年M月d日(E)', { locale: ja })
    
    // その日に既に登録されている対応可能日を探す
    const existingEvent = availableDates.find((date) => {
      const eventDate = startOfDay(new Date(date.startDate))
      return eventDate.getTime() === clickedDate.getTime()
    })

    if (existingEvent) {
      // 既に登録されている場合は削除確認
      const confirmDelete = confirm(
        `${formattedDate}の出勤可能日を削除しますか？\n\n削除すると、この日は対応不可として扱われます。`
      )
      
      if (confirmDelete) {
        setIsLoading(true)
        try {
          const response = await fetch(`/api/engineer/calendar/${existingEvent.id}`, {
            method: 'DELETE',
          })

          if (response.ok) {
            router.refresh()
          } else {
            alert('削除に失敗しました')
          }
        } catch (error) {
          console.error('削除エラー:', error)
          alert('削除に失敗しました')
        } finally {
          setIsLoading(false)
        }
      }
    } else {
      // 新規登録確認
      const confirmAdd = confirm(
        `${formattedDate}を出勤可能日として登録しますか？\n\n登録すると、VAXAL社員がこの日に案件を割り振ることができます。`
      )
      
      if (confirmAdd) {
        setIsLoading(true)
        try {
          const response = await fetch('/api/engineer/calendar', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              date: clickedDate.toISOString(),
            }),
          })

          if (response.ok) {
            router.refresh()
          } else {
            alert('登録に失敗しました')
          }
        } catch (error) {
          console.error('登録エラー:', error)
          alert('登録に失敗しました')
        } finally {
          setIsLoading(false)
        }
      }
    }
  }

  // イベントのスタイル設定
  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = '#eab308' // デフォルト: 黄色（対応可能日）

    if (event.eventType === 'CONFIRMED') {
      // 確定予定の場合はプロジェクトのステータスに応じて色を変更
      const status = event.project?.status
      
      switch (status) {
        case 'PENDING':
          backgroundColor = '#6b7280' // グレー（注文仮登録 - 通常表示されない）
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
          backgroundColor = '#3b82f6' // デフォルト: 青色
      }
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

  // 年月選択の変更ハンドラー（URLパラメータを更新）
  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = parseInt(e.target.value)
    const newDate = new Date(newYear, currentDate.getMonth(), 1)
    setCurrentDate(newDate)
    
    // URLパラメータを更新してページをリロード
    const yearMonth = `${newYear}-${String(newDate.getMonth() + 1).padStart(2, '0')}`
    router.push(`/engineer/calendar?month=${yearMonth}`)
  }

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = parseInt(e.target.value)
    const newDate = new Date(currentDate.getFullYear(), newMonth, 1)
    setCurrentDate(newDate)
    
    // URLパラメータを更新してページをリロード
    const yearMonth = `${newDate.getFullYear()}-${String(newMonth + 1).padStart(2, '0')}`
    router.push(`/engineer/calendar?month=${yearMonth}`)
  }

  // 年の選択肢を生成（現在年の前後5年）
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i)
  const months = Array.from({ length: 12 }, (_, i) => i)

  return (
    <div className="space-y-4">
      {/* 年月選択プルダウン */}
      <div className="flex gap-4 items-center">
        <div className="flex items-center gap-2">
          <label htmlFor="year-select" className="text-sm font-medium text-gray-700">
            年:
          </label>
          <select
            id="year-select"
            value={currentDate.getFullYear()}
            onChange={handleYearChange}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}年
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <label htmlFor="month-select" className="text-sm font-medium text-gray-700">
            月:
          </label>
          <select
            id="month-select"
            value={currentDate.getMonth()}
            onChange={handleMonthChange}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {months.map((month) => (
              <option key={month} value={month}>
                {month + 1}月
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* カレンダー */}
      <div className="relative" style={{ height: '600px' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          eventPropGetter={eventStyleGetter}
          messages={messages}
          culture="ja"
          views={['month']}
          defaultView="month"
          date={currentDate}
          onNavigate={(newDate) => setCurrentDate(newDate)}
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={async (event) => {
          if (isLoading) return

          // 確定予定の場合は案件詳細に遷移
          if (event.eventType === 'CONFIRMED' && event.project) {
            router.push(`/engineer/project/${event.project.id}`)
          } 
          // 対応可能日の場合は削除確認
          else if (event.eventType === 'AVAILABLE') {
            const formattedDate = format(event.start, 'yyyy年M月d日(E)', { locale: ja })
            const confirmDelete = confirm(
              `${formattedDate}の出勤可能日を削除しますか？\n\n削除すると、この日は対応不可として扱われます。`
            )
            
            if (confirmDelete) {
              setIsLoading(true)
              try {
                const response = await fetch(`/api/engineer/calendar/${event.id}`, {
                  method: 'DELETE',
                })

                if (response.ok) {
                  router.refresh()
                } else {
                  const errorData = await response.json()
                  alert(errorData.error || '削除に失敗しました')
                }
              } catch (error) {
                console.error('削除エラー:', error)
                alert('削除に失敗しました')
              } finally {
                setIsLoading(false)
              }
            }
          }
          }}
        />
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center rounded-lg z-10">
            <div className="bg-white px-6 py-4 rounded-lg shadow-lg">
              <p className="text-gray-700 font-medium">処理中...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
