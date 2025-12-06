'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarEmbed } from '@/components/calendar/calendar-embed'

export function OrderForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // フォームの状態管理
  const [formData, setFormData] = useState({
    // 基本情報
    siteName: '',
    siteAddress: '',
    overview: '',
    customerName: '',
    customerBirthDate: '',
    applicantRelationship: '',
    customerAddress: '',
    customerPhone: '',
    firstInquiryDate: new Date().toISOString().slice(0, 16),
    
    // 工事情報
    workContent: 'ECO_CUTE',
    workType: 'REPLACEMENT',
    workTime: '09:00~17:00',
    
    // 商品情報（エコキュート）
    productSetNumber: '',
    productTankNumber: '',
    productHeatPumpNumber: '',
    productRemoteNumber: '',
    productBaseNumber: '',
    productFallNumber: '',
    productUlbroNumber: '',
    productOtherNumber: '',
    
    // 支払い情報
    paymentAmount: '',
    productWarranty: false,
    warrantyPeriod: 'FIVE_YEARS',
    paymentMethod: 'CASH',
    subsidyAmount: '',
    sellingPrice: '',
    costPrice: '',
    hasHandMoney: false,
    handMoneyAmount: '',
    idCardRequired: false,
    bankbookRequired: false,
    
    // メモ
    additionalWork: '',
    existingProductInfo: '',
    constructionNotes: '',
    
    // 日程
    workDate: '',
    receptionDate: new Date().toISOString().split('T')[0],
    orderDate: '',
    expectedCompletionDate: '',
    completionDate: '',
    
    // 社内メモ（VAXAL専用）
    firstContactMethod: 'EMAIL',
    communicationTool: '',
    internalNotes: '',
    
    // 再訪問情報
    revisitType: '',
    revisitDateTime: '',
    revisitCount: '',
    crossSellContent: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/vaxal/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '注文の登録に失敗しました')
      }

      const data = await response.json()
      router.push(`/vaxal/project/${data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '注文の登録に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 基本情報 */}
      <Card>
        <CardHeader>
          <CardTitle>基本情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">現場名 *</Label>
              <Input
                id="siteName"
                value={formData.siteName}
                onChange={(e) => handleChange('siteName', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="siteAddress">現場住所 *</Label>
              <Input
                id="siteAddress"
                value={formData.siteAddress}
                onChange={(e) => handleChange('siteAddress', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="overview">概要</Label>
            <Input
              id="overview"
              value={formData.overview}
              onChange={(e) => handleChange('overview', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">お客様の名前 *</Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={(e) => handleChange('customerName', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerBirthDate">お客様の生年月日 *</Label>
              <Input
                id="customerBirthDate"
                type="date"
                value={formData.customerBirthDate}
                onChange={(e) => handleChange('customerBirthDate', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="applicantRelationship">申込者の続柄</Label>
              <Input
                id="applicantRelationship"
                value={formData.applicantRelationship}
                onChange={(e) => handleChange('applicantRelationship', e.target.value)}
                placeholder="例: 本人、配偶者、子"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="firstInquiryDate">初回お問い合わせ日時 *</Label>
              <Input
                id="firstInquiryDate"
                type="datetime-local"
                value={formData.firstInquiryDate}
                onChange={(e) => handleChange('firstInquiryDate', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerAddress">住所 *</Label>
              <Input
                id="customerAddress"
                value={formData.customerAddress}
                onChange={(e) => handleChange('customerAddress', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerPhone">電話番号 *</Label>
              <Input
                id="customerPhone"
                type="tel"
                value={formData.customerPhone}
                onChange={(e) => handleChange('customerPhone', e.target.value)}
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 工事情報 */}
      <Card>
        <CardHeader>
          <CardTitle>工事情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="workContent">工事内容 *</Label>
              <select
                id="workContent"
                className="w-full h-10 px-3 rounded-md border border-gray-300"
                value={formData.workContent}
                onChange={(e) => handleChange('workContent', e.target.value)}
                required
              >
                <option value="ECO_CUTE">エコキュート</option>
                <option value="GAS_WATER_HEATER">ガス給湯器</option>
                <option value="ELECTRIC_HEATER">電気温水器</option>
                <option value="BATHROOM_DRYER">浴室乾燥機</option>
                <option value="SOLAR_PANEL">太陽光パネル</option>
                <option value="OTHER">その他</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="workType">用途 *</Label>
              <select
                id="workType"
                className="w-full h-10 px-3 rounded-md border border-gray-300"
                value={formData.workType}
                onChange={(e) => handleChange('workType', e.target.value)}
                required
              >
                <option value="NEW_INSTALLATION">新設</option>
                <option value="REFORM">リフォーム</option>
                <option value="REPLACEMENT">交換</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="workTime">施工時間</Label>
            <Input
              id="workTime"
              value={formData.workTime}
              onChange={(e) => handleChange('workTime', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* 商品情報（エコキュート） */}
      {formData.workContent === 'ECO_CUTE' && (
        <Card>
          <CardHeader>
            <CardTitle>商品情報（エコキュート）</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="productSetNumber">セット品番</Label>
                <Input
                  id="productSetNumber"
                  value={formData.productSetNumber}
                  onChange={(e) => handleChange('productSetNumber', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="productTankNumber">タンク品番</Label>
                <Input
                  id="productTankNumber"
                  value={formData.productTankNumber}
                  onChange={(e) => handleChange('productTankNumber', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="productHeatPumpNumber">ヒートポンプ品番</Label>
                <Input
                  id="productHeatPumpNumber"
                  value={formData.productHeatPumpNumber}
                  onChange={(e) => handleChange('productHeatPumpNumber', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="productRemoteNumber">リモコン品番</Label>
                <Input
                  id="productRemoteNumber"
                  value={formData.productRemoteNumber}
                  onChange={(e) => handleChange('productRemoteNumber', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="productBaseNumber">脚部カバー品番</Label>
                <Input
                  id="productBaseNumber"
                  value={formData.productBaseNumber}
                  onChange={(e) => handleChange('productBaseNumber', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="productFallNumber">転倒防止品番</Label>
                <Input
                  id="productFallNumber"
                  value={formData.productFallNumber}
                  onChange={(e) => handleChange('productFallNumber', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="productUlbroNumber">ウルブロ品番</Label>
                <Input
                  id="productUlbroNumber"
                  value={formData.productUlbroNumber}
                  onChange={(e) => handleChange('productUlbroNumber', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="productOtherNumber">その他の品番</Label>
                <Input
                  id="productOtherNumber"
                  value={formData.productOtherNumber}
                  onChange={(e) => handleChange('productOtherNumber', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* お支払い */}
      <Card>
        <CardHeader>
          <CardTitle>お支払い</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="paymentAmount">金額</Label>
              <Input
                id="paymentAmount"
                type="number"
                value={formData.paymentAmount}
                onChange={(e) => handleChange('paymentAmount', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">支払い方法</Label>
              <select
                id="paymentMethod"
                className="w-full h-10 px-3 rounded-md border border-gray-300"
                value={formData.paymentMethod}
                onChange={(e) => handleChange('paymentMethod', e.target.value)}
              >
                <option value="CASH">現金</option>
                <option value="CARD">カード</option>
                <option value="LOAN">ローン</option>
                <option value="BANK_TRANSFER">銀行振込</option>
                <option value="ELECTRONIC_MONEY">電子マネー</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subsidyAmount">補助金金額</Label>
              <Input
                id="subsidyAmount"
                type="number"
                value={formData.subsidyAmount}
                onChange={(e) => handleChange('subsidyAmount', e.target.value)}
                placeholder="円"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sellingPrice">売価</Label>
              <Input
                id="sellingPrice"
                type="number"
                value={formData.sellingPrice}
                onChange={(e) => handleChange('sellingPrice', e.target.value)}
                placeholder="円"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="costPrice">原価</Label>
              <Input
                id="costPrice"
                type="number"
                value={formData.costPrice}
                onChange={(e) => handleChange('costPrice', e.target.value)}
                placeholder="円"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="warrantyPeriod">商品保証期間</Label>
              <select
                id="warrantyPeriod"
                className="w-full h-10 px-3 rounded-md border border-gray-300"
                value={formData.warrantyPeriod}
                onChange={(e) => handleChange('warrantyPeriod', e.target.value)}
              >
                <option value="FIVE_YEARS">5年</option>
                <option value="SEVEN_YEARS">7年</option>
                <option value="TEN_YEARS">10年</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="hasHandMoney"
              checked={formData.hasHandMoney}
              onChange={(e) => handleChange('hasHandMoney', e.target.checked)}
              className="w-4 h-4"
            />
            <Label htmlFor="hasHandMoney">手元の有無（アルバイト代金）</Label>
          </div>

          {formData.hasHandMoney && (
            <div className="space-y-2">
              <Label htmlFor="handMoneyAmount">手元の代金</Label>
              <Input
                id="handMoneyAmount"
                type="number"
                value={formData.handMoneyAmount}
                onChange={(e) => handleChange('handMoneyAmount', e.target.value)}
                placeholder="円"
              />
            </div>
          )}

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="idCardRequired"
              checked={formData.idCardRequired}
              onChange={(e) => handleChange('idCardRequired', e.target.checked)}
              className="w-4 h-4"
            />
            <Label htmlFor="idCardRequired">身分証（現場で頂く必要あり）</Label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="bankbookRequired"
              checked={formData.bankbookRequired}
              onChange={(e) => handleChange('bankbookRequired', e.target.checked)}
              className="w-4 h-4"
            />
            <Label htmlFor="bankbookRequired">通帳（現場で頂く必要あり）</Label>
          </div>
        </CardContent>
      </Card>

      {/* メモ */}
      <Card>
        <CardHeader>
          <CardTitle>メモ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="additionalWork">追加工事</Label>
            <textarea
              id="additionalWork"
              className="w-full min-h-[100px] px-3 py-2 rounded-md border border-gray-300"
              value={formData.additionalWork}
              onChange={(e) => handleChange('additionalWork', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="existingProductInfo">既存商品情報</Label>
            <textarea
              id="existingProductInfo"
              className="w-full min-h-[100px] px-3 py-2 rounded-md border border-gray-300"
              value={formData.existingProductInfo}
              onChange={(e) => handleChange('existingProductInfo', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="constructionNotes">施工指示</Label>
            <textarea
              id="constructionNotes"
              className="w-full min-h-[100px] px-3 py-2 rounded-md border border-gray-300"
              value={formData.constructionNotes}
              onChange={(e) => handleChange('constructionNotes', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* 日程 */}
      <Card>
        <CardHeader>
          <CardTitle>日程</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="workDate">工事日</Label>
              <Input
                id="workDate"
                type="date"
                value={formData.workDate}
                onChange={(e) => handleChange('workDate', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="receptionDate">受付日</Label>
              <Input
                id="receptionDate"
                type="date"
                value={formData.receptionDate}
                onChange={(e) => handleChange('receptionDate', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="orderDate">受注日</Label>
              <Input
                id="orderDate"
                type="date"
                value={formData.orderDate}
                onChange={(e) => handleChange('orderDate', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expectedCompletionDate">完了予定日</Label>
              <Input
                id="expectedCompletionDate"
                type="date"
                value={formData.expectedCompletionDate}
                onChange={(e) => handleChange('expectedCompletionDate', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="completionDate">完了日</Label>
            <Input
              id="completionDate"
              type="date"
              value={formData.completionDate}
              onChange={(e) => handleChange('completionDate', e.target.value)}
            />
          </div>

          {/* カレンダー表示 */}
          <div className="mt-6">
            <h3 className="text-sm font-medium mb-3">工事予定カレンダー</h3>
            <CalendarEmbed />
          </div>
        </CardContent>
      </Card>

      {/* 社内メモ（VAXAL専用） */}
      <Card>
        <CardHeader>
          <CardTitle>社内メモ（VAXAL専用）</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="firstContactMethod">ファーストコンタクトの連絡手段</Label>
            <select
              id="firstContactMethod"
              className="w-full h-10 px-3 rounded-md border border-gray-300"
              value={formData.firstContactMethod}
              onChange={(e) => handleChange('firstContactMethod', e.target.value)}
            >
              <option value="EMAIL">メール</option>
              <option value="PHONE">電話</option>
              <option value="INQUIRY_FORM">お問い合わせフォーム</option>
              <option value="LINE">LINE</option>
              <option value="SNS">SNS</option>
              <option value="OTHER">その他</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="communicationTool">連絡ツール *</Label>
            <textarea
              id="communicationTool"
              className="w-full min-h-[80px] px-3 py-2 rounded-md border border-gray-300"
              value={formData.communicationTool}
              onChange={(e) => handleChange('communicationTool', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="internalNotes">備考欄</Label>
            <textarea
              id="internalNotes"
              className="w-full min-h-[80px] px-3 py-2 rounded-md border border-gray-300"
              value={formData.internalNotes}
              onChange={(e) => handleChange('internalNotes', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="revisitType">再訪問種別</Label>
              <select
                id="revisitType"
                className="w-full h-10 px-3 rounded-md border border-gray-300"
                value={formData.revisitType}
                onChange={(e) => handleChange('revisitType', e.target.value)}
              >
                <option value="">選択してください</option>
                <option value="COMPLAINT">クレーム</option>
                <option value="REPURCHASE">再購入</option>
                <option value="ANOTHER_CASE">別案件</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="revisitDateTime">再訪問日時</Label>
              <Input
                id="revisitDateTime"
                type="datetime-local"
                value={formData.revisitDateTime}
                onChange={(e) => handleChange('revisitDateTime', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="revisitCount">再訪問回数</Label>
              <Input
                id="revisitCount"
                type="number"
                value={formData.revisitCount}
                onChange={(e) => handleChange('revisitCount', e.target.value)}
                placeholder="回"
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="crossSellContent">クロスセル内容</Label>
              <Input
                id="crossSellContent"
                value={formData.crossSellContent}
                onChange={(e) => handleChange('crossSellContent', e.target.value)}
                placeholder="例: 太陽光パネル、蓄電池"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          onClick={() => router.back()}
          disabled={isLoading}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          キャンセル
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isLoading ? '登録中...' : '注文を登録'}
        </Button>
      </div>
    </form>
  )
}
