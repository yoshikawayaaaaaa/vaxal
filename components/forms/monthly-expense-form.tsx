'use client'

import { useRouter } from 'next/navigation'
import { Label } from '@/components/ui/label'
import { useState } from 'react'

interface MonthlyExpenseFormProps {
  selectedYear: number
  selectedMonth: number
}

export function MonthlyExpenseForm({ selectedYear, selectedMonth }: MonthlyExpenseFormProps) {
  const router = useRouter()
  const [year, setYear] = useState(selectedYear)
  const [month, setMonth] = useState(selectedMonth)

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = parseInt(e.target.value)
    setYear(newYear)
    router.push(`/vaxal/monthly?year=${newYear}&month=${month}`)
  }

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = parseInt(e.target.value)
    setMonth(newMonth)
    router.push(`/vaxal/monthly?year=${year}&month=${newMonth}`)
  }

  // 年のオプション（2025年〜2026年）
  const yearOptions = [2026, 2025]

  // 月のオプション（1月〜12月）
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1)

  return (
    <div className="mb-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="yearSelect">年</Label>
          <select
            id="yearSelect"
            className="w-full h-10 px-3 rounded-md border border-gray-300"
            value={year}
            onChange={handleYearChange}
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}年
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="monthSelect">月</Label>
          <select
            id="monthSelect"
            className="w-full h-10 px-3 rounded-md border border-gray-300"
            value={month}
            onChange={handleMonthChange}
          >
            {monthOptions.map((m) => (
              <option key={m} value={m}>
                {m}月
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
