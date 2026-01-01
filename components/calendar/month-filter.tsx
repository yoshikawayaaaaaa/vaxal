'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export function MonthFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // 現在の年月を取得（デフォルトは当月）
  const monthParam = searchParams.get('month')
  const currentDate = monthParam ? new Date(monthParam) : new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()

  // 年の選択肢を生成（現在年の前後5年）
  const now = new Date()
  const years = Array.from({ length: 11 }, (_, i) => now.getFullYear() - 5 + i)
  const months = Array.from({ length: 12 }, (_, i) => i)

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = parseInt(e.target.value)
    const yearMonth = `${newYear}-${String(currentMonth + 1).padStart(2, '0')}`
    
    const params = new URLSearchParams(searchParams.toString())
    params.set('month', yearMonth)
    router.push(`/vaxal/calendar?${params.toString()}`)
  }

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = parseInt(e.target.value)
    const yearMonth = `${currentYear}-${String(newMonth + 1).padStart(2, '0')}`
    
    const params = new URLSearchParams(searchParams.toString())
    params.set('month', yearMonth)
    router.push(`/vaxal/calendar?${params.toString()}`)
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <label htmlFor="year-select" className="text-sm font-medium text-gray-700">
          年:
        </label>
        <select
          id="year-select"
          value={currentYear}
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
          value={currentMonth}
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
    </>
  )
}
