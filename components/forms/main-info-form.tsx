'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface MainInfoFormProps {
  projectId: string
  projectNumber: string
  initialData?: any
  constructionNotesFromProject?: string
  contractAmount?: number | null
  userRole?: string
  engineerRole?: string
}

export function MainInfoForm({ 
  projectId, 
  projectNumber, 
  initialData,
  constructionNotesFromProject,
  contractAmount,
  userRole,
  engineerRole
}: MainInfoFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    // 施工指示
    constructionNotes: initialData?.constructionNotes || constructionNotesFromProject || '',
    
    // 元請け情報
    contractorName: initialData?.contractorName || '',
    contractorPhone: initialData?.contractorPhone || '',
    contractorNotes: initialData?.contractorNotes || '',
    
    // VAXAL担当者情報
    receptionStaff: initialData?.receptionStaff || '',
    receptionStaffPhone: initialData?.receptionStaffPhone || '',
    salesStaff: initialData?.salesStaff || '',
    salesStaffPhone: initialData?.salesStaffPhone || '',
    constructionStaff: initialData?.constructionStaff || '',
    constructionStaffPhone: initialData?.constructionStaffPhone || '',
    staffNotes: initialData?.staffNotes || '',
    
    // 建築情報
    roofingDate: initialData?.roofingDate ? new Date(initialData.roofingDate).toISOString().split('T')[0] : '',
    demolitionDate: initialData?.demolitionDate ? new Date(initialData.demolitionDate).toISOString().split('T')[0] : '',
    buildingType: initialData?.buildingType || '',
    installationFloor: initialData?.installationFloor || '',
    installationLocation: initialData?.installationLocation || '',
    keyboxNumber: initialData?.keyboxNumber || '',
    storageLocation: initialData?.storageLocation || '',
    parkingSpace: initialData?.parkingSpace || '',
    buildingNotes: initialData?.buildingNotes || '',
    
    // 商品情報
    productCategory: initialData?.productCategory || '',
    productSeries: initialData?.productSeries || '',
    deliveryDate: initialData?.deliveryDate ? new Date(initialData.deliveryDate).toISOString().split('T')[0] : '',
    shipmentDate: initialData?.shipmentDate ? new Date(initialData.shipmentDate).toISOString().split('T')[0] : '',
    productNotes: initialData?.productNotes || '',
    
    // 配送情報
    deliveryTime: initialData?.deliveryTime || '',
    deliverySpecification: initialData?.deliverySpecification || '',
    deliveryLocation: initialData?.deliveryLocation || '',
    deliveryNotes: initialData?.deliveryNotes || '',
    
    // 現場調査情報
    surveyRequestDate: initialData?.surveyRequestDate ? new Date(initialData.surveyRequestDate).toISOString().split('T')[0] : '',
    surveyDate: initialData?.surveyDate ? new Date(initialData.surveyDate).toISOString().split('T')[0] : '',
    surveyTime: initialData?.surveyTime || '',
    surveyCompany: initialData?.surveyCompany || '',
    surveyStaff: initialData?.surveyStaff || '',
    reSurveyDate: initialData?.reSurveyDate ? new Date(initialData.reSurveyDate).toISOString().split('T')[0] : '',
    surveyNotes: initialData?.surveyNotes || '',
    
    // 施工情報
    constructionDate: initialData?.constructionDate ? new Date(initialData.constructionDate).toISOString().split('T')[0] : '',
    constructionCompany: initialData?.constructionCompany || '',
    constructionStaffName: initialData?.constructionStaffName || '',
    constructionPhone: initialData?.constructionPhone || '',
    constructionEmail: initialData?.constructionEmail || '',
    remainingWorkDate: initialData?.remainingWorkDate ? new Date(initialData.remainingWorkDate).toISOString().split('T')[0] : '',
    constructionInfoNotes: initialData?.constructionInfoNotes || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch(`/api/vaxal/projects/${projectId}/main-info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('主要情報の保存に失敗しました')
      }

      router.refresh()
      alert('主要情報を保存しました')
    } catch (err) {
      setError(err instanceof Error ? err.message : '主要情報の保存に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 施工指示 */}
      <Card>
        <CardHeader>
          <CardTitle>施工指示</CardTitle>
        </CardHeader>
        <CardContent>
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

      {/* 元請け情報 */}
      <Card>
        <CardHeader>
          <CardTitle>元請け情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contractorName">担当者</Label>
              <Input
                id="contractorName"
                value={formData.contractorName}
                onChange={(e) => handleChange('contractorName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contractorPhone">TEL</Label>
              <Input
                id="contractorPhone"
                type="tel"
                value={formData.contractorPhone}
                onChange={(e) => handleChange('contractorPhone', e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="contractorNotes">備考欄</Label>
            <textarea
              id="contractorNotes"
              className="w-full min-h-[80px] px-3 py-2 rounded-md border border-gray-300"
              value={formData.contractorNotes}
              onChange={(e) => handleChange('contractorNotes', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* VAXAL担当者情報 */}
      <Card>
        <CardHeader>
          <CardTitle>VAXAL担当者情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 受付担当者 */}
          <div className="pb-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold mb-4">受付担当者</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="receptionStaff">担当者名</Label>
                <Input
                  id="receptionStaff"
                  value={formData.receptionStaff}
                  onChange={(e) => handleChange('receptionStaff', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="receptionStaffPhone">TEL</Label>
                <Input
                  id="receptionStaffPhone"
                  type="tel"
                  value={formData.receptionStaffPhone}
                  onChange={(e) => handleChange('receptionStaffPhone', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* 営業担当者 */}
          <div className="pb-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold mb-4">営業担当者</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salesStaff">担当者名</Label>
                <Input
                  id="salesStaff"
                  value={formData.salesStaff}
                  onChange={(e) => handleChange('salesStaff', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salesStaffPhone">TEL</Label>
                <Input
                  id="salesStaffPhone"
                  type="tel"
                  value={formData.salesStaffPhone}
                  onChange={(e) => handleChange('salesStaffPhone', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* 工務担当者 */}
          <div className="pb-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold mb-4">工務担当者</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="constructionStaff">担当者名</Label>
                <Input
                  id="constructionStaff"
                  value={formData.constructionStaff}
                  onChange={(e) => handleChange('constructionStaff', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="constructionStaffPhone">TEL</Label>
                <Input
                  id="constructionStaffPhone"
                  type="tel"
                  value={formData.constructionStaffPhone}
                  onChange={(e) => handleChange('constructionStaffPhone', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* 備考欄 */}
          <div className="space-y-2">
            <Label htmlFor="staffNotes">備考欄</Label>
            <textarea
              id="staffNotes"
              className="w-full min-h-[80px] px-3 py-2 rounded-md border border-gray-300"
              value={formData.staffNotes}
              onChange={(e) => handleChange('staffNotes', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* 建築情報 */}
      <Card>
        <CardHeader>
          <CardTitle>建築情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="roofingDate">上棟日</Label>
              <Input
                id="roofingDate"
                type="date"
                value={formData.roofingDate}
                onChange={(e) => handleChange('roofingDate', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="demolitionDate">解体日</Label>
              <Input
                id="demolitionDate"
                type="date"
                value={formData.demolitionDate}
                onChange={(e) => handleChange('demolitionDate', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="buildingType">建物区分名</Label>
              <select
                id="buildingType"
                className="w-full h-10 px-3 rounded-md border border-gray-300"
                value={formData.buildingType}
                onChange={(e) => handleChange('buildingType', e.target.value)}
              >
                <option value="">選択してください</option>
                <option value="MANSION">マンション</option>
                <option value="DETACHED_HOUSE">戸建て</option>
                <option value="APARTMENT">アパート</option>
                <option value="OTHER">その他</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="installationFloor">設置階数</Label>
              <Input
                id="installationFloor"
                value={formData.installationFloor}
                onChange={(e) => handleChange('installationFloor', e.target.value)}
                placeholder="例: 1F, 2F, 3F"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="keyboxNumber">キーボックスNo</Label>
              <Input
                id="keyboxNumber"
                value={formData.keyboxNumber}
                onChange={(e) => handleChange('keyboxNumber', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="storageLocation">保管場所</Label>
              <Input
                id="storageLocation"
                value={formData.storageLocation}
                onChange={(e) => handleChange('storageLocation', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="installationLocation">設置場所</Label>
            <textarea
              id="installationLocation"
              className="w-full min-h-[80px] px-3 py-2 rounded-md border border-gray-300"
              value={formData.installationLocation}
              onChange={(e) => handleChange('installationLocation', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="parkingSpace">駐車スペース</Label>
            <textarea
              id="parkingSpace"
              className="w-full min-h-[80px] px-3 py-2 rounded-md border border-gray-300"
              value={formData.parkingSpace}
              onChange={(e) => handleChange('parkingSpace', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="buildingNotes">備考欄</Label>
            <textarea
              id="buildingNotes"
              className="w-full min-h-[80px] px-3 py-2 rounded-md border border-gray-300"
              value={formData.buildingNotes}
              onChange={(e) => handleChange('buildingNotes', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* 商品情報 */}
      <Card>
        <CardHeader>
          <CardTitle>商品情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="productCategory">機種区分</Label>
              <Input
                id="productCategory"
                value={formData.productCategory}
                onChange={(e) => handleChange('productCategory', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="productSeries">シリーズ名</Label>
              <Input
                id="productSeries"
                value={formData.productSeries}
                onChange={(e) => handleChange('productSeries', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deliveryDate">荷受け日</Label>
              <Input
                id="deliveryDate"
                type="date"
                value={formData.deliveryDate}
                onChange={(e) => handleChange('deliveryDate', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shipmentDate">出荷日</Label>
              <Input
                id="shipmentDate"
                type="date"
                value={formData.shipmentDate}
                onChange={(e) => handleChange('shipmentDate', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="productNotes">備考欄</Label>
            <textarea
              id="productNotes"
              className="w-full min-h-[80px] px-3 py-2 rounded-md border border-gray-300"
              value={formData.productNotes}
              onChange={(e) => handleChange('productNotes', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* 配送情報 */}
      <Card>
        <CardHeader>
          <CardTitle>配送情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deliveryTime">配送時間</Label>
              <Input
                id="deliveryTime"
                value={formData.deliveryTime}
                onChange={(e) => handleChange('deliveryTime', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deliverySpecification">配送指定</Label>
              <Input
                id="deliverySpecification"
                value={formData.deliverySpecification}
                onChange={(e) => handleChange('deliverySpecification', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deliveryLocation">搬入場所指定</Label>
              <Input
                id="deliveryLocation"
                value={formData.deliveryLocation}
                onChange={(e) => handleChange('deliveryLocation', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deliveryNotes">備考欄</Label>
            <textarea
              id="deliveryNotes"
              className="w-full min-h-[80px] px-3 py-2 rounded-md border border-gray-300"
              value={formData.deliveryNotes}
              onChange={(e) => handleChange('deliveryNotes', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* 現場調査情報 */}
      <Card>
        <CardHeader>
          <CardTitle>現場調査情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="surveyRequestDate">現場調査希望日</Label>
              <Input
                id="surveyRequestDate"
                type="date"
                value={formData.surveyRequestDate}
                onChange={(e) => handleChange('surveyRequestDate', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="surveyDate">現場調査日（完了後）</Label>
              <Input
                id="surveyDate"
                type="date"
                value={formData.surveyDate}
                onChange={(e) => handleChange('surveyDate', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="surveyTime">現場調査時間（完了後）</Label>
              <Input
                id="surveyTime"
                value={formData.surveyTime}
                onChange={(e) => handleChange('surveyTime', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="surveyCompany">管理業者名</Label>
              <Input
                id="surveyCompany"
                value={formData.surveyCompany}
                onChange={(e) => handleChange('surveyCompany', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="surveyStaff">現場調査実施者</Label>
              <Input
                id="surveyStaff"
                value={formData.surveyStaff}
                onChange={(e) => handleChange('surveyStaff', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reSurveyDate">再現場調査日</Label>
              <Input
                id="reSurveyDate"
                type="date"
                value={formData.reSurveyDate}
                onChange={(e) => handleChange('reSurveyDate', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>現場調査フォルダ</Label>
            <p className="text-sm text-gray-400">※ 下見報告後に閲覧可能になります</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="surveyNotes">備考欄</Label>
            <textarea
              id="surveyNotes"
              className="w-full min-h-[80px] px-3 py-2 rounded-md border border-gray-300"
              value={formData.surveyNotes}
              onChange={(e) => handleChange('surveyNotes', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* 施工情報 */}
      <Card>
        <CardHeader>
          <CardTitle>施工情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="constructionDate">施工日</Label>
              <Input
                id="constructionDate"
                type="date"
                value={formData.constructionDate}
                onChange={(e) => handleChange('constructionDate', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="constructionCompany">施工会社</Label>
              <Input
                id="constructionCompany"
                value={formData.constructionCompany}
                onChange={(e) => handleChange('constructionCompany', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="constructionStaffName">施工担当者名</Label>
              <Input
                id="constructionStaffName"
                value={formData.constructionStaffName}
                onChange={(e) => handleChange('constructionStaffName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="constructionPhone">TEL</Label>
              <Input
                id="constructionPhone"
                type="tel"
                value={formData.constructionPhone}
                onChange={(e) => handleChange('constructionPhone', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="constructionEmail">E-mail</Label>
              <Input
                id="constructionEmail"
                type="email"
                value={formData.constructionEmail}
                onChange={(e) => handleChange('constructionEmail', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="remainingWorkDate">残工事日</Label>
              <Input
                id="remainingWorkDate"
                type="date"
                value={formData.remainingWorkDate}
                onChange={(e) => handleChange('remainingWorkDate', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="constructionInfoNotes">備考欄</Label>
            <textarea
              id="constructionInfoNotes"
              className="w-full min-h-[80px] px-3 py-2 rounded-md border border-gray-300"
              value={formData.constructionInfoNotes}
              onChange={(e) => handleChange('constructionInfoNotes', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
          {error}
        </div>
      )}

      <div className="flex justify-end">
        <Button 
          type="submit" 
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8"
        >
          {isLoading ? '保存中...' : '保存'}
        </Button>
      </div>
    </form>
  )
}
