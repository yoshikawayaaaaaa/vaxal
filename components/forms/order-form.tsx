'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarEmbed } from '@/components/calendar/calendar-embed'

interface EngineerCompany {
  id: string
  companyName: string
  masterUser: {
    id: string
    name: string
    email: string
  } | null
  staffUsers: {
    id: string
    name: string
    email: string
  }[]
}

interface SellingPriceType {
  id: string
  name: string
  displayOrder: number
  isActive: boolean
}

interface OrderFormProps {
  engineerCompanies: EngineerCompany[]
}

export function OrderForm({ engineerCompanies }: OrderFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [availableEngineers, setAvailableEngineers] = useState<any[]>([])
  const [loadingEngineers, setLoadingEngineers] = useState(false)
  const [sellingPriceTypes, setSellingPriceTypes] = useState<SellingPriceType[]>([])
  const [sellingPrices, setSellingPrices] = useState<Record<string, string>>({})
  const [selectedSellingPriceTypes, setSelectedSellingPriceTypes] = useState<string[]>([])

  // 売価タイプをAPIから取得
  useEffect(() => {
    const fetchSellingPriceTypes = async () => {
      try {
        const response = await fetch('/api/vaxal/selling-price-types')
        if (response.ok) {
          const data = await response.json()
          // 有効な売価タイプのみを取得
          setSellingPriceTypes(data.filter((type: SellingPriceType) => type.isActive))
        }
      } catch (error) {
        console.error('売価タイプ取得エラー:', error)
      }
    }

    fetchSellingPriceTypes()
  }, [])

  // フォームの状態管理
  const [formData, setFormData] = useState({
    // エンジニア割り振り
    assignedEngineerId: '',
    
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
    buildingType: 'DETACHED_HOUSE',
    
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
    sellingPriceTypes: [] as string[], // 選択された売価タイプの配列
    sellingPrice1: '',
    sellingPrice2: '',
    sellingPrice3: '',
    costPrice: '',
    contractAmount: '',
    hasHandMoney: false,
    handMoneyAmount: '',
    hasRemoteTravelFee: false,
    remoteTravelDistance: '',
    remoteTravelFee: '',
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
      // 売価データをJSON形式に変換
      const sellingPricesData: Record<string, number> = {}
      Object.entries(sellingPrices).forEach(([key, value]) => {
        if (value) {
          sellingPricesData[key] = parseInt(value)
        }
      })

      const submitData = {
        ...formData,
        sellingPrices: Object.keys(sellingPricesData).length > 0 ? sellingPricesData : null
      }

      const response = await fetch('/api/vaxal/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
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
    
    // 工事日が変更されたら、その日に出勤可能なエンジニアを取得
    if (field === 'workDate' && value) {
      fetchAvailableEngineers(value)
    }
  }

  // 指定日に出勤可能なエンジニアを取得
  const fetchAvailableEngineers = async (date: string) => {
    setLoadingEngineers(true)
    try {
      const response = await fetch(`/api/engineer/available?date=${date}`)
      if (response.ok) {
        const data = await response.json()
        setAvailableEngineers(data.companies || [])
      } else {
        setAvailableEngineers([])
      }
    } catch (error) {
      console.error('出勤可能エンジニア取得エラー:', error)
      setAvailableEngineers([])
    } finally {
      setLoadingEngineers(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 日程（エンジニア割り振りの前に移動） */}
      <Card>
        <CardHeader>
          <CardTitle>日程</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="workDate">工事日 *</Label>
              <Input
                id="workDate"
                type="date"
                value={formData.workDate}
                onChange={(e) => handleChange('workDate', e.target.value)}
                required
              />
              {formData.workDate && (
                <p className="text-xs text-gray-500">
                  この日に出勤可能なエンジニアのみ選択できます
                </p>
              )}
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
        </CardContent>
      </Card>

      {/* エンジニア割り振り */}
      {formData.workDate && (
        <Card>
          <CardHeader>
            <CardTitle>エンジニア割り振り</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingEngineers ? (
              <div className="text-center py-4">
                <p className="text-gray-500">出勤可能なエンジニアを検索中...</p>
              </div>
            ) : availableEngineers.length > 0 ? (
              <>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                  <p className="text-sm font-medium text-green-900">
                    ✅ {formData.workDate}に出勤可能なエンジニア: {availableEngineers.reduce((sum, company) => sum + company.engineers.length, 0)}名
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="assignedEngineerId">担当エンジニア</Label>
                  <select
                    id="assignedEngineerId"
                    className="w-full h-10 px-3 rounded-md border border-gray-300"
                    value={formData.assignedEngineerId}
                    onChange={(e) => handleChange('assignedEngineerId', e.target.value)}
                  >
                    <option value="">選択してください</option>
                    {availableEngineers.map((company) => (
                      <optgroup key={company.companyId} label={company.companyName}>
                        {company.engineers.map((engineer: any) => (
                          <option key={engineer.id} value={engineer.id}>
                            {engineer.name} (残り{engineer.remainingSlots}枠)
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                {/* 選択されたエンジニアの案件情報を表示 */}
                {formData.assignedEngineerId && availableEngineers.length > 0 && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-3">選択したエンジニアの当日案件</h4>
                    {(() => {
                      const selectedEngineer = availableEngineers
                        .flatMap(c => c.engineers)
                        .find((e: any) => e.id === formData.assignedEngineerId)
                      
                      if (!selectedEngineer) return null
                      
                      if (selectedEngineer.assignedProjects.length === 0) {
                        return (
                          <p className="text-sm text-blue-700">
                            この日はまだ案件が割り振られていません（0/5）
                          </p>
                        )
                      }
                      
                      return (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-blue-900 mb-2">
                            既に{selectedEngineer.assignedCount}件の案件が割り振られています（残り{selectedEngineer.remainingSlots}枠）
                          </p>
                          {selectedEngineer.assignedProjects.map((project: any, index: number) => (
                            <div key={project.id} className="text-sm bg-white p-3 rounded border border-blue-100">
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <span className="font-medium text-gray-700">案件{index + 1}:</span>
                                  <span className="ml-2 text-gray-900">{project.siteName}</span>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-700">工事内容:</span>
                                  <span className="ml-2 text-gray-900">{project.workContentLabel}</span>
                                </div>
                                <div className="col-span-2">
                                  <span className="font-medium text-gray-700">現場住所:</span>
                                  <span className="ml-2 text-gray-900">{project.siteAddress}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    })()}
                  </div>
                )}
              </>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm font-medium text-yellow-900 mb-2">
                  ⚠️ 出勤可能なエンジニアがいません
                </p>
                <p className="text-sm text-yellow-700">
                  {formData.workDate}に出勤可能として登録しているエンジニアがいません。別の日付を選択するか、エンジニアに出勤可能日を登録してもらってください。
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 出勤可能なエンジニアがいる場合のみ、以下のフォームを表示 */}
      {formData.workDate && availableEngineers.length > 0 && !loadingEngineers && (
        <>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="workTime">施工時間</Label>
              <Input
                id="workTime"
                value={formData.workTime}
                onChange={(e) => handleChange('workTime', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="buildingType">建物区分名 *</Label>
              <select
                id="buildingType"
                className="w-full h-10 px-3 rounded-md border border-gray-300"
                value={formData.buildingType}
                onChange={(e) => handleChange('buildingType', e.target.value)}
                required
              >
                <option value="DETACHED_HOUSE">戸建て</option>
                <option value="MANSION">マンション</option>
                <option value="APARTMENT">アパート</option>
                <option value="OTHER">その他</option>
              </select>
            </div>
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

          {/* 売価タイプ選択（動的） */}
          {sellingPriceTypes.length > 0 && (
            <>
              <div className="space-y-3">
                <Label>売価タイプ（複数選択可）</Label>
                <div className="space-y-2">
                  {sellingPriceTypes.map((type) => (
                    <div key={type.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`sellingPriceType-${type.id}`}
                        checked={selectedSellingPriceTypes.includes(type.name)}
                        onChange={(e) => {
                          const newTypes = e.target.checked
                            ? [...selectedSellingPriceTypes, type.name]
                            : selectedSellingPriceTypes.filter(t => t !== type.name)
                          setSelectedSellingPriceTypes(newTypes)
                        }}
                        className="w-4 h-4"
                      />
                      <Label htmlFor={`sellingPriceType-${type.id}`} className="cursor-pointer">
                        {type.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* 選択された売価タイプの金額入力フォーム（動的） */}
              {selectedSellingPriceTypes.map((typeName) => (
                <div key={typeName} className="space-y-2">
                  <Label htmlFor={`sellingPrice-${typeName}`}>売価：{typeName}</Label>
                  <Input
                    id={`sellingPrice-${typeName}`}
                    type="number"
                    value={sellingPrices[typeName] || ''}
                    onChange={(e) => {
                      setSellingPrices(prev => ({
                        ...prev,
                        [typeName]: e.target.value
                      }))
                    }}
                    placeholder="円"
                  />
                </div>
              ))}
            </>
          )}

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
              <Label htmlFor="contractAmount">請負金額（マスターのみ閲覧可）</Label>
              <Input
                id="contractAmount"
                type="number"
                value={formData.contractAmount}
                onChange={(e) => handleChange('contractAmount', e.target.value)}
                placeholder="円"
              />
            </div>
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
              id="hasRemoteTravelFee"
              checked={formData.hasRemoteTravelFee}
              onChange={(e) => handleChange('hasRemoteTravelFee', e.target.checked)}
              className="w-4 h-4"
            />
            <Label htmlFor="hasRemoteTravelFee">遠方出張費</Label>
          </div>

          {formData.hasRemoteTravelFee && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="remoteTravelDistance">距離（km）</Label>
                <Input
                  id="remoteTravelDistance"
                  type="number"
                  value={formData.remoteTravelDistance}
                  onChange={(e) => handleChange('remoteTravelDistance', e.target.value)}
                  placeholder="km"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="remoteTravelFee">金額</Label>
                <Input
                  id="remoteTravelFee"
                  type="number"
                  value={formData.remoteTravelFee}
                  onChange={(e) => handleChange('remoteTravelFee', e.target.value)}
                  placeholder="円"
                />
              </div>
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
      </>
      )}
    </form>
  )
}
