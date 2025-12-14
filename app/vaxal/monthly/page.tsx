import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { MonthlyExpenseForm } from '@/components/forms/monthly-expense-form'

export default async function MonthlyExpensePage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string; success?: string }>
}) {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  // VAXAL社員のみアクセス可能
  if (session.user.role !== 'VAXAL_ADMIN') {
    redirect('/dashboard')
  }

  const params = await searchParams
  
  // 現在の年月を取得
  const now = new Date()
  const selectedYear = params.year ? parseInt(params.year) : now.getFullYear()
  const selectedMonth = params.month ? parseInt(params.month) : now.getMonth() + 1
  const showSuccess = params.success === 'true'

  // 選択された月のデータを取得
  const monthlyExpense = await prisma.monthlyExpense.findUnique({
    where: {
      year_month: {
        year: selectedYear,
        month: selectedMonth,
      },
    },
  })


  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">月次管理</h1>
          <p className="text-gray-600 mt-2">
            {selectedYear}年{selectedMonth}月の経費を管理します
          </p>
        </div>

        {/* 成功メッセージ */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800 font-medium">✓ 保存が完了しました</p>
          </div>
        )}

        {/* 年月選択 */}
        <MonthlyExpenseForm
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
        />

        <form action="/api/vaxal/monthly" method="POST">
          <input type="hidden" name="year" value={selectedYear} />
          <input type="hidden" name="month" value={selectedMonth} />

          <Card>
            <CardHeader>
              <CardTitle>経費項目</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="wasteDisposalFee">産廃処分費</Label>
                  <Input
                    id="wasteDisposalFee"
                    name="wasteDisposalFee"
                    type="number"
                    defaultValue={monthlyExpense?.wasteDisposalFee || ''}
                    placeholder="円"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicleFee">車両費</Label>
                  <Input
                    id="vehicleFee"
                    name="vehicleFee"
                    type="number"
                    defaultValue={monthlyExpense?.vehicleFee || ''}
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
                    defaultValue={monthlyExpense?.laborCost || ''}
                    placeholder="円"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="warehouseFee">倉庫管理費</Label>
                  <Input
                    id="warehouseFee"
                    name="warehouseFee"
                    type="number"
                    defaultValue={monthlyExpense?.warehouseFee || ''}
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
                    defaultValue={monthlyExpense?.officeFee || ''}
                    placeholder="円"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="communicationFee">通信費</Label>
                  <Input
                    id="communicationFee"
                    name="communicationFee"
                    type="number"
                    defaultValue={monthlyExpense?.communicationFee || ''}
                    placeholder="円"
                  />
                </div>
              </div>
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
