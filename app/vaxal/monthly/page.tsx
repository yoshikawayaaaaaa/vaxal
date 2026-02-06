'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface CustomItem {
  itemName: string
  amount: number
}

interface MonthlyExpensePageProps {
  searchParams: Promise<{ year?: string; month?: string; success?: string }>
}

export default function MonthlyExpensePage({ searchParams }: MonthlyExpensePageProps) {
  const router = useRouter()
  const [params, setParams] = useState<{ year?: string; month?: string; success?: string }>({})
  const [monthlyExpense, setMonthlyExpense] = useState<any>(null)
  const [customItems, setCustomItems] = useState<CustomItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    searchParams.then(p => {
      setParams(p)
      const now = new Date()
      const year = p.year ? parseInt(p.year) : now.getFullYear()
      const month = p.month ? parseInt(p.month) : now.getMonth() + 1
      
      setSelectedYear(year)
      setSelectedMonth(month)
      setShowSuccess(p.success === 'true')
      
      // データ取得
      fetch(`/api/vaxal/monthly?year=${year}&month=${month}`)
        .then(res => res.json())
        .then(data => {
          setMonthlyExpense(data.monthlyExpense)
          setCustomItems(data.customItems || [])
          setLoading(false)
        })
        .catch(() => setLoading(false))
    })
  }, [searchParams])

  const addCustomItem = () => {
    setCustomItems([...customItems, { itemName: '', amount: 0 }])
  }

  const removeCustomItem = (index: number) => {
    setCustomItems(customItems.filter((_, i) => i !== index))
  }

  const updateCustomItem = (index: number, field: 'itemName' | 'amount', value: string | number) => {
    const updated = [...customItems]
    updated[index] = { ...updated[index], [field]: value }
    setCustomItems(updated)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.append('customItems', JSON.stringify(customItems))

    try {
      const response = await fetch('/api/vaxal/monthly', {
        method: 'POST',
        body: formData,
      })

      if (response.redirected) {
        window.location.href = response.url
      }
    } catch (error) {
      console.error('保存エラー:', error)
    }
  }

  if (loading) {
    return <div className="p-8">読み込み中...</div>
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">月次管理</h1>
          <p className="text-gray-600 mt-2">
            {selectedYear}年{selectedMonth}月の経費を管理します
          </p>
        </div>

        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800 font-medium">✓ 保存が完了しました</p>
          </div>
        )}

        {/* 年月選択 */}
        <div className="mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="yearSelect">年</Label>
              <select
                id="yearSelect"
                className="w-full h-10 px-3 rounded-md border border-gray-300"
                value={selectedYear}
                onChange={(e) => router.push(`/vaxal/monthly?year=${e.target.value}&month=${selectedMonth}`)}
              >
                {[2026, 2025].map((y) => (
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
                value={selectedMonth}
                onChange={(e) => router.push(`/vaxal/monthly?year=${selectedYear}&month=${e.target.value}`)}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {m}月
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <input type="hidden" name="year" value={selectedYear} />
          <input type="hidden" name="month" value={selectedMonth} />

          {/* 固定経費項目 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>固定経費項目</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="wasteDisposalFee">産廃処分費</Label>
                  <Input
                    id="wasteDisposalFee"
                    name="wasteDisposalFee"
                    type="number"
                    value={monthlyExpense?.wasteDisposalFee || ''}
                    onChange={(e) => setMonthlyExpense({ ...monthlyExpense, wasteDisposalFee: e.target.value ? parseInt(e.target.value) : null })}
                    placeholder="円"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicleFee">車両費</Label>
                  <Input
                    id="vehicleFee"
                    name="vehicleFee"
                    type="number"
                    value={monthlyExpense?.vehicleFee || ''}
                    onChange={(e) => setMonthlyExpense({ ...monthlyExpense, vehicleFee: e.target.value ? parseInt(e.target.value) : null })}
                    placeholder="円"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="laborCost">人件費</Label>
                  <Input
                    id="laborCost"
                    name="laborCost"
                    type="number"
                    value={monthlyExpense?.laborCost || ''}
                    onChange={(e) => setMonthlyExpense({ ...monthlyExpense, laborCost: e.target.value ? parseInt(e.target.value) : null })}
                    placeholder="円"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="warehouseFee">倉庫管理費</Label>
                  <Input
                    id="warehouseFee"
                    name="warehouseFee"
                    type="number"
                    value={monthlyExpense?.warehouseFee || ''}
                    onChange={(e) => setMonthlyExpense({ ...monthlyExpense, warehouseFee: e.target.value ? parseInt(e.target.value) : null })}
                    placeholder="円"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="officeFee">事務所費</Label>
                  <Input
                    id="officeFee"
                    name="officeFee"
                    type="number"
                    value={monthlyExpense?.officeFee || ''}
                    onChange={(e) => setMonthlyExpense({ ...monthlyExpense, officeFee: e.target.value ? parseInt(e.target.value) : null })}
                    placeholder="円"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="communicationFee">通信費</Label>
                  <Input
                    id="communicationFee"
                    name="communicationFee"
                    type="number"
                    value={monthlyExpense?.communicationFee || ''}
                    onChange={(e) => setMonthlyExpense({ ...monthlyExpense, communicationFee: e.target.value ? parseInt(e.target.value) : null })}
                    placeholder="円"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* カスタム経費項目 */}
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>カスタム経費項目</CardTitle>
              <Button
                type="button"
                onClick={addCustomItem}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                + 項目を追加
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {customItems.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  カスタム項目はありません。「+ 項目を追加」ボタンで追加できます。
                </p>
              ) : (
                customItems.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-4 items-end">
                    <div className="col-span-5 space-y-2">
                      <Label htmlFor={`customItemName${index}`}>項目名</Label>
                      <Input
                        id={`customItemName${index}`}
                        type="text"
                        value={item.itemName}
                        onChange={(e) => updateCustomItem(index, 'itemName', e.target.value)}
                        placeholder="例: 広告費"
                      />
                    </div>
                    <div className="col-span-5 space-y-2">
                      <Label htmlFor={`customItemAmount${index}`}>金額</Label>
                      <Input
                        id={`customItemAmount${index}`}
                        type="number"
                        value={item.amount || ''}
                        onChange={(e) => updateCustomItem(index, 'amount', parseInt(e.target.value) || 0)}
                        placeholder="円"
                      />
                    </div>
                    <div className="col-span-2">
                      <Button
                        type="button"
                        onClick={() => removeCustomItem(index)}
                        variant="outline"
                        className="w-full border-red-300 text-red-600 hover:bg-red-50"
                      >
                        削除
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <div className="mt-6 flex justify-end">
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8">
              保存
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
