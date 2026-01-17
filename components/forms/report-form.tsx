'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import imageCompression from 'browser-image-compression'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ReportFormProps {
  projectId: string
  projectNumber: string
}

type TabId = 'SITE_SURVEY' | 'PICKUP' | 'CHECK_IN' | 'COMPLETION' | 'UNLOADING' | 'SUBSIDY_PHOTO' | 'OPTIONAL_PHOTOS' | 'ENGINEER_INFO'

interface ImageData {
  files: File[]
  previews: string[]
}

interface PickupMaterialRow {
  id: string
  inventoryItemId: string
  inventoryItemName: string
  productName: string
  manufacturer: string
  partNumber: string
  quantity: number
  unitType: 'PIECE' | 'METER'
  unitPrice: number
}

interface InventoryItem {
  id: string
  name: string
  productName: string | null
  manufacturer: string | null
  partNumber: string | null
  unitPrice: number
  unitType: 'PIECE' | 'METER'
  currentStock: number
}

export function ReportForm({ projectId, projectNumber }: ReportFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<TabId>('SITE_SURVEY')
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [pickupMaterials, setPickupMaterials] = useState<PickupMaterialRow[]>([])

  // 各報告タイプの画像を管理
  const [images, setImages] = useState<Record<string, ImageData>>({
    SITE_SURVEY: { files: [], previews: [] },
    PICKUP: { files: [], previews: [] },
    CHECK_IN: { files: [], previews: [] },
    COMPLETION: { files: [], previews: [] },
    UNLOADING: { files: [], previews: [] },
    SUBSIDY_PHOTO: { files: [], previews: [] },
    APPEARANCE_PHOTO: { files: [], previews: [] },
    BEFORE_WORK_PHOTO: { files: [], previews: [] },
    REGULATION_PHOTO: { files: [], previews: [] },
    FREE_PHOTO: { files: [], previews: [] },
  })

  const [formData, setFormData] = useState({
    notes: '',
    isWorkCompleted: 'true', // 工事完了/未完了
    remainingWorkDate: '', // 残工事日
    existingManufacturer: '',
    yearsOfUse: '',
    replacementType: '',
    replacementManufacturer: '',
    tankCapacity: '',
    tankType: '',
    hasSpecialSpec: false,
    materialUnitPrice: '',
    highwayFee: '',
    gasolineFee: '',
    saleType: '',
    saleFee: '',
  })

  const tabs = [
    { id: 'SITE_SURVEY' as const, label: '現場調査報告' },
    { id: 'PICKUP' as const, label: '集荷報告' },
    { id: 'CHECK_IN' as const, label: 'check in報告' },
    { id: 'COMPLETION' as const, label: '工事完了報告' },
    { id: 'UNLOADING' as const, label: '荷卸し報告' },
    { id: 'SUBSIDY_PHOTO' as const, label: '補助金申請写真' },
    { id: 'OPTIONAL_PHOTOS' as const, label: '任意写真' },
    { id: 'ENGINEER_INFO' as const, label: 'エンジニア入力情報' },
  ]

  // 在庫アイテムを取得
  useEffect(() => {
    const fetchInventoryItems = async () => {
      try {
        const response = await fetch('/api/engineer/inventory')
        if (response.ok) {
          const data = await response.json()
          setInventoryItems(data.items || [])
        }
      } catch (error) {
        console.error('在庫取得エラー:', error)
      }
    }
    fetchInventoryItems()
  }, [])

  // 集荷部材行を追加
  const addPickupMaterialRow = () => {
    setPickupMaterials([
      ...pickupMaterials,
      {
        id: Math.random().toString(36).substr(2, 9),
        inventoryItemId: '',
        inventoryItemName: '',
        productName: '',
        manufacturer: '',
        partNumber: '',
        quantity: 0,
        unitType: 'PIECE',
        unitPrice: 0,
      },
    ])
  }

  // 集荷部材行を削除
  const removePickupMaterialRow = (id: string) => {
    setPickupMaterials(pickupMaterials.filter((row) => row.id !== id))
  }

  // 在庫アイテム選択時の処理
  const handleInventoryItemChange = (rowId: string, inventoryItemId: string) => {
    // inventoryItemIdを数値に変換して比較
    const selectedItem = inventoryItems.find((item) => String(item.id) === inventoryItemId)
    
    if (selectedItem) {
      setPickupMaterials(
        pickupMaterials.map((row) =>
          row.id === rowId
            ? {
                ...row,
                inventoryItemId: String(selectedItem.id),
                inventoryItemName: selectedItem.name,
                productName: selectedItem.productName || '',
                manufacturer: selectedItem.manufacturer || '',
                partNumber: selectedItem.partNumber || '',
                unitType: selectedItem.unitType,
                unitPrice: selectedItem.unitPrice,
              }
            : row
        )
      )
    }
  }

  // 集荷部材の数量変更
  const handleQuantityChange = (rowId: string, quantity: number) => {
    setPickupMaterials(
      pickupMaterials.map((row) => (row.id === rowId ? { ...row, quantity } : row))
    )
  }

  // 画像圧縮関数
  const compressImage = async (file: File): Promise<File> => {
    if (!file.type.startsWith('image/')) {
      return file
    }

    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: 'image/webp',
    }

    try {
      const compressedFile = await imageCompression(file, options)
      const newFileName = file.name.replace(/\.[^/.]+$/, '.webp')
      return new File([compressedFile], newFileName, { type: 'image/webp' })
    } catch (error) {
      console.error('画像圧縮エラー:', error)
      return file
    }
  }

  const handleImageChange = async (reportType: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    // 枚数制限チェック（最大20枚）
    const currentCount = images[reportType].files.length
    if (currentCount + files.length > 20) {
      setError(`${reportType}は最大20枚までアップロードできます（現在${currentCount}枚）`)
      e.target.value = ''
      return
    }

    setError('')
    
    // 画像を圧縮
    const compressedFiles = await Promise.all(files.map(file => compressImage(file)))
    
    const newPreviews: string[] = []
    let loadedCount = 0

    compressedFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        newPreviews.push(reader.result as string)
        loadedCount++
        
        if (loadedCount === compressedFiles.length) {
          setImages((prev) => ({
            ...prev,
            [reportType]: {
              files: [...prev[reportType].files, ...compressedFiles],
              previews: [...prev[reportType].previews, ...newPreviews],
            },
          }))
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (reportType: string, index: number) => {
    setImages((prev) => ({
      ...prev,
      [reportType]: {
        files: prev[reportType].files.filter((_, i) => i !== index),
        previews: prev[reportType].previews.filter((_, i) => i !== index),
      },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // 画像アップロード必須チェック（エンジニア入力情報以外）
      const requiredReportTypes = ['SITE_SURVEY', 'PICKUP', 'CHECK_IN', 'COMPLETION', 'UNLOADING', 'SUBSIDY_PHOTO']
      const missingImages: string[] = []

      requiredReportTypes.forEach((type) => {
        if (images[type].files.length === 0) {
          const label = tabs.find(t => t.id === type)?.label || type
          missingImages.push(label)
        }
      })

      if (missingImages.length > 0) {
        setError(`以下の報告に画像をアップロードしてください: ${missingImages.join(', ')}`)
        setIsLoading(false)
        return
      }

      // FormDataを作成
      const submitData = new FormData()
      
      // プロジェクトIDを追加
      submitData.append('projectId', projectId)
      
      // 集荷部材データをJSON形式で追加
      submitData.append('pickupMaterialsData', JSON.stringify(pickupMaterials))
      
      // エンジニア入力情報を追加
      submitData.append('notes', formData.notes)
      submitData.append('isWorkCompleted', formData.isWorkCompleted)
      submitData.append('remainingWorkDate', formData.remainingWorkDate)
      submitData.append('existingManufacturer', formData.existingManufacturer)
      submitData.append('yearsOfUse', formData.yearsOfUse)
      submitData.append('replacementType', formData.replacementType)
      submitData.append('replacementManufacturer', formData.replacementManufacturer)
      submitData.append('tankCapacity', formData.tankCapacity)
      submitData.append('tankType', formData.tankType)
      submitData.append('hasSpecialSpec', String(formData.hasSpecialSpec))
      submitData.append('materialUnitPrice', formData.materialUnitPrice)
      submitData.append('highwayFee', formData.highwayFee)
      submitData.append('gasolineFee', formData.gasolineFee)
      submitData.append('saleType', formData.saleType)
      submitData.append('saleFee', formData.saleFee)

      // 各報告タイプの画像を追加
      Object.entries(images).forEach(([reportType, data]) => {
        data.files.forEach((file, index) => {
          submitData.append(`${reportType}_${index}`, file)
        })
        submitData.append(`${reportType}_count`, String(data.files.length))
      })

      const response = await fetch('/api/engineer/reports', {
        method: 'POST',
        body: submitData,
      })

      if (!response.ok) {
        throw new Error('報告の保存に失敗しました')
      }

      router.push(`/engineer/project/${projectId}/report`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : '報告の保存に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* タブナビゲーション */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px grid grid-cols-3 md:flex md:space-x-8 gap-2 md:gap-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`
                py-2 md:py-4 px-1 md:px-1 border-b-2 font-medium text-xs md:text-sm text-center
                ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <span className="whitespace-nowrap">{tab.label}</span>
              {tab.id !== 'ENGINEER_INFO' && tab.id !== 'OPTIONAL_PHOTOS' && images[tab.id]?.files.length > 0 && (
                <span className="ml-1 md:ml-2 bg-blue-100 text-blue-600 py-0.5 px-1 md:px-2 rounded-full text-xs inline-block">
                  {images[tab.id].files.length}
                </span>
              )}
              {tab.id === 'OPTIONAL_PHOTOS' && (
                images.APPEARANCE_PHOTO.files.length + 
                images.BEFORE_WORK_PHOTO.files.length + 
                images.REGULATION_PHOTO.files.length + 
                images.FREE_PHOTO.files.length
              ) > 0 && (
                <span className="ml-1 md:ml-2 bg-blue-100 text-blue-600 py-0.5 px-1 md:px-2 rounded-full text-xs inline-block">
                  {images.APPEARANCE_PHOTO.files.length + 
                   images.BEFORE_WORK_PHOTO.files.length + 
                   images.REGULATION_PHOTO.files.length + 
                   images.FREE_PHOTO.files.length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* タブコンテンツ */}
      <div className="mt-6">
        {/* 現場調査報告 */}
        {activeTab === 'SITE_SURVEY' && (
          <Card>
            <CardHeader>
              <CardTitle>現場調査報告</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="site-survey-images">画像を選択</Label>
                <Input
                  id="site-survey-images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleImageChange('SITE_SURVEY', e)}
                  className="cursor-pointer"
                />
                <p className="text-sm text-gray-500">
                  複数の画像を選択できます（JPG, PNG, GIF）
                </p>
              </div>

              {images.SITE_SURVEY.previews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {images.SITE_SURVEY.previews.map((preview, index) => (
                    <div key={index} className="relative border rounded-lg p-2">
                      <img
                        src={preview}
                        alt={`プレビュー ${index + 1}`}
                        className="w-full h-32 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage('SITE_SURVEY', index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                      <p className="text-xs text-gray-600 mt-1 truncate">
                        {images.SITE_SURVEY.files[index]?.name}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 集荷報告 */}
        {activeTab === 'PICKUP' && (
          <Card>
            <CardHeader>
              <CardTitle>集荷報告</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 集荷部材リスト */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>使用部材</Label>
                  <Button
                    type="button"
                    onClick={addPickupMaterialRow}
                    className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2"
                  >
                    + 部材を追加
                  </Button>
                </div>

                {pickupMaterials.length === 0 ? (
                  <p className="text-gray-400 text-sm">
                    「+ 部材を追加」ボタンをクリックして使用した部材を追加してください
                  </p>
                ) : (
                  <div className="space-y-3">
                    {pickupMaterials.map((row, index) => (
                      <div key={row.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-sm">部材 {index + 1}</span>
                          <button
                            type="button"
                            onClick={() => removePickupMaterialRow(row.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            削除
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          {/* 部材名選択 */}
                          <div className="space-y-1">
                            <Label className="text-xs">部材名 *</Label>
                            <select
                              className="w-full h-9 px-2 text-sm rounded-md border border-gray-300"
                              value={row.inventoryItemId}
                              onChange={(e) => handleInventoryItemChange(row.id, e.target.value)}
                            >
                              <option value="">選択してください</option>
                              {inventoryItems.map((item) => (
                                <option key={item.id} value={item.id}>
                                  {item.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* 商品名（自動入力） */}
                          <div className="space-y-1">
                            <Label className="text-xs">商品名</Label>
                            <Input
                              type="text"
                              value={row.productName}
                              disabled
                              className="h-9 text-sm bg-gray-50"
                              placeholder="-"
                            />
                          </div>

                          {/* メーカー（自動入力） */}
                          <div className="space-y-1">
                            <Label className="text-xs">メーカー</Label>
                            <Input
                              type="text"
                              value={row.manufacturer}
                              disabled
                              className="h-9 text-sm bg-gray-50"
                              placeholder="-"
                            />
                          </div>

                          {/* 品番（自動入力） */}
                          <div className="space-y-1">
                            <Label className="text-xs">品番</Label>
                            <Input
                              type="text"
                              value={row.partNumber}
                              disabled
                              className="h-9 text-sm bg-gray-50"
                              placeholder="-"
                            />
                          </div>

                          {/* 使用数量 */}
                          <div className="space-y-1">
                            <Label className="text-xs">
                              使用数量 * ({row.unitType === 'PIECE' ? '個' : 'メートル'})
                            </Label>
                            <Input
                              type="number"
                              value={row.quantity === 0 ? '' : row.quantity}
                              onChange={(e) =>
                                handleQuantityChange(
                                  row.id,
                                  e.target.value === '' ? 0 : parseInt(e.target.value)
                                )
                              }
                              className="h-9 text-sm"
                              placeholder="0"
                              min="0"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-4 border-t">
                <Label htmlFor="pickup-images">画像を選択</Label>
                <Input
                  id="pickup-images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleImageChange('PICKUP', e)}
                  className="cursor-pointer"
                />
              </div>

              {images.PICKUP.previews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {images.PICKUP.previews.map((preview, index) => (
                    <div key={index} className="relative border rounded-lg p-2">
                      <img
                        src={preview}
                        alt={`プレビュー ${index + 1}`}
                        className="w-full h-32 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage('PICKUP', index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                      <p className="text-xs text-gray-600 mt-1 truncate">
                        {images.PICKUP.files[index]?.name}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* check in報告 */}
        {activeTab === 'CHECK_IN' && (
          <Card>
            <CardHeader>
              <CardTitle>check in報告</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="checkin-images">画像を選択</Label>
                <Input
                  id="checkin-images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleImageChange('CHECK_IN', e)}
                  className="cursor-pointer"
                />
              </div>

              {images.CHECK_IN.previews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {images.CHECK_IN.previews.map((preview, index) => (
                    <div key={index} className="relative border rounded-lg p-2">
                      <img
                        src={preview}
                        alt={`プレビュー ${index + 1}`}
                        className="w-full h-32 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage('CHECK_IN', index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                      <p className="text-xs text-gray-600 mt-1 truncate">
                        {images.CHECK_IN.files[index]?.name}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 工事完了報告 */}
        {activeTab === 'COMPLETION' && (
          <Card>
            <CardHeader>
              <CardTitle>工事完了報告</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="isWorkCompleted">工事完了ステータス</Label>
                <select
                  id="isWorkCompleted"
                  className="w-full h-10 px-3 rounded-md border border-gray-300"
                  value={formData.isWorkCompleted}
                  onChange={(e) => handleChange('isWorkCompleted', e.target.value)}
                >
                  <option value="true">完了</option>
                  <option value="false">未完了</option>
                </select>
              </div>

              {formData.isWorkCompleted === 'false' && (
                <div className="space-y-2">
                  <Label htmlFor="remainingWorkDate">残工事日</Label>
                  <Input
                    id="remainingWorkDate"
                    type="date"
                    value={formData.remainingWorkDate}
                    onChange={(e) => handleChange('remainingWorkDate', e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="completion-images">画像を選択</Label>
                <Input
                  id="completion-images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleImageChange('COMPLETION', e)}
                  className="cursor-pointer"
                />
              </div>

              {images.COMPLETION.previews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {images.COMPLETION.previews.map((preview, index) => (
                    <div key={index} className="relative border rounded-lg p-2">
                      <img
                        src={preview}
                        alt={`プレビュー ${index + 1}`}
                        className="w-full h-32 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage('COMPLETION', index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                      <p className="text-xs text-gray-600 mt-1 truncate">
                        {images.COMPLETION.files[index]?.name}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 荷卸し報告 */}
        {activeTab === 'UNLOADING' && (
          <Card>
            <CardHeader>
              <CardTitle>荷卸し報告</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="unloading-images">画像を選択</Label>
                <Input
                  id="unloading-images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleImageChange('UNLOADING', e)}
                  className="cursor-pointer"
                />
              </div>

              {images.UNLOADING.previews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {images.UNLOADING.previews.map((preview, index) => (
                    <div key={index} className="relative border rounded-lg p-2">
                      <img
                        src={preview}
                        alt={`プレビュー ${index + 1}`}
                        className="w-full h-32 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage('UNLOADING', index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                      <p className="text-xs text-gray-600 mt-1 truncate">
                        {images.UNLOADING.files[index]?.name}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 補助金申請写真 */}
        {activeTab === 'SUBSIDY_PHOTO' && (
          <Card>
            <CardHeader>
              <CardTitle>補助金申請写真</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subsidy-photo-images">画像を選択</Label>
                <Input
                  id="subsidy-photo-images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleImageChange('SUBSIDY_PHOTO', e)}
                  className="cursor-pointer"
                />
                <p className="text-sm text-gray-500">
                  補助金申請に必要な写真をアップロードしてください
                </p>
              </div>

              {images.SUBSIDY_PHOTO.previews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {images.SUBSIDY_PHOTO.previews.map((preview, index) => (
                    <div key={index} className="relative border rounded-lg p-2">
                      <img
                        src={preview}
                        alt={`プレビュー ${index + 1}`}
                        className="w-full h-32 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage('SUBSIDY_PHOTO', index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                      <p className="text-xs text-gray-600 mt-1 truncate">
                        {images.SUBSIDY_PHOTO.files[index]?.name}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 任意写真 */}
        {activeTab === 'OPTIONAL_PHOTOS' && (
          <div className="space-y-6">
            {/* 身だしなみ写真 */}
            <Card>
              <CardHeader>
                <CardTitle>身だしなみ写真（任意）</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="appearance-photo-images">画像を選択</Label>
                  <Input
                    id="appearance-photo-images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleImageChange('APPEARANCE_PHOTO', e)}
                    className="cursor-pointer"
                  />
                </div>

                {images.APPEARANCE_PHOTO.previews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images.APPEARANCE_PHOTO.previews.map((preview, index) => (
                      <div key={index} className="relative border rounded-lg p-2">
                        <img
                          src={preview}
                          alt={`プレビュー ${index + 1}`}
                          className="w-full h-32 object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage('APPEARANCE_PHOTO', index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                        <p className="text-xs text-gray-600 mt-1 truncate">
                          {images.APPEARANCE_PHOTO.files[index]?.name}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 工事前写真 */}
            <Card>
              <CardHeader>
                <CardTitle>工事前写真（任意）</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="before-work-photo-images">画像を選択</Label>
                  <Input
                    id="before-work-photo-images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleImageChange('BEFORE_WORK_PHOTO', e)}
                    className="cursor-pointer"
                  />
                </div>

                {images.BEFORE_WORK_PHOTO.previews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images.BEFORE_WORK_PHOTO.previews.map((preview, index) => (
                      <div key={index} className="relative border rounded-lg p-2">
                        <img
                          src={preview}
                          alt={`プレビュー ${index + 1}`}
                          className="w-full h-32 object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage('BEFORE_WORK_PHOTO', index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                        <p className="text-xs text-gray-600 mt-1 truncate">
                          {images.BEFORE_WORK_PHOTO.files[index]?.name}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 規定写真 */}
            <Card>
              <CardHeader>
                <CardTitle>規定写真（任意）</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="regulation-photo-images">画像を選択</Label>
                  <Input
                    id="regulation-photo-images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleImageChange('REGULATION_PHOTO', e)}
                    className="cursor-pointer"
                  />
                </div>

                {images.REGULATION_PHOTO.previews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images.REGULATION_PHOTO.previews.map((preview, index) => (
                      <div key={index} className="relative border rounded-lg p-2">
                        <img
                          src={preview}
                          alt={`プレビュー ${index + 1}`}
                          className="w-full h-32 object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage('REGULATION_PHOTO', index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                        <p className="text-xs text-gray-600 mt-1 truncate">
                          {images.REGULATION_PHOTO.files[index]?.name}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* フリー写真 */}
            <Card>
              <CardHeader>
                <CardTitle>フリー写真（任意）</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="free-photo-images">画像を選択</Label>
                  <Input
                    id="free-photo-images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleImageChange('FREE_PHOTO', e)}
                    className="cursor-pointer"
                  />
                </div>

                {images.FREE_PHOTO.previews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images.FREE_PHOTO.previews.map((preview, index) => (
                      <div key={index} className="relative border rounded-lg p-2">
                        <img
                          src={preview}
                          alt={`プレビュー ${index + 1}`}
                          className="w-full h-32 object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage('FREE_PHOTO', index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                        <p className="text-xs text-gray-600 mt-1 truncate">
                          {images.FREE_PHOTO.files[index]?.name}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* エンジニア入力情報 */}
        {activeTab === 'ENGINEER_INFO' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">エンジニア入力情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="existingManufacturer">既設メーカー</Label>
                  <select
                    id="existingManufacturer"
                    className="w-full h-10 px-3 rounded-md border border-gray-300"
                    value={formData.existingManufacturer}
                    onChange={(e) => handleChange('existingManufacturer', e.target.value)}
                  >
                    <option value="">選択してください</option>
                    <option value="Panasonic">Panasonic</option>
                    <option value="ダイキン">ダイキン</option>
                    <option value="日立">日立</option>
                    <option value="三菱">三菱</option>
                    <option value="コロナ">コロナ</option>
                    <option value="タカラスタンダード">タカラスタンダード</option>
                    <option value="ハウステック">ハウステック</option>
                    <option value="長府製作所">長府製作所</option>
                    <option value="キューヘン">キューヘン</option>
                    <option value="東芝">東芝</option>
                    <option value="デンソー">デンソー</option>
                    <option value="その他">その他</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yearsOfUse">使用年数</Label>
                  <Input
                    id="yearsOfUse"
                    type="number"
                    value={formData.yearsOfUse}
                    onChange={(e) => handleChange('yearsOfUse', e.target.value)}
                    placeholder="例: 10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="replacementType">交換種別</Label>
                  <select
                    id="replacementType"
                    className="w-full h-10 px-3 rounded-md border border-gray-300"
                    value={formData.replacementType}
                    onChange={(e) => handleChange('replacementType', e.target.value)}
                  >
                    <option value="">選択してください</option>
                    <option value="ECO_TO_ECO">エコキュート→エコキュート</option>
                    <option value="GAS_TO_ECO">ガス給湯器→エコキュート</option>
                    <option value="ELECTRIC_TO_ECO">電気温水器→エコキュート</option>
                    <option value="OTHER">その他</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="replacementManufacturer">交換メーカー</Label>
                  <select
                    id="replacementManufacturer"
                    className="w-full h-10 px-3 rounded-md border border-gray-300"
                    value={formData.replacementManufacturer}
                    onChange={(e) => handleChange('replacementManufacturer', e.target.value)}
                  >
                    <option value="">選択してください</option>
                    <option value="Panasonic">Panasonic</option>
                    <option value="ダイキン">ダイキン</option>
                    <option value="日立">日立</option>
                    <option value="三菱">三菱</option>
                    <option value="コロナ">コロナ</option>
                    <option value="タカラスタンダード">タカラスタンダード</option>
                    <option value="ハウステック">ハウステック</option>
                    <option value="長府製作所">長府製作所</option>
                    <option value="キューヘン">キューヘン</option>
                    <option value="東芝">東芝</option>
                    <option value="デンソー">デンソー</option>
                    <option value="その他">その他</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tankCapacity">タンク容量</Label>
                  <Input
                    id="tankCapacity"
                    value={formData.tankCapacity}
                    onChange={(e) => handleChange('tankCapacity', e.target.value)}
                    placeholder="例: 370L"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tankType">タンクタイプ</Label>
                  <select
                    id="tankType"
                    className="w-full h-10 px-3 rounded-md border border-gray-300"
                    value={formData.tankType}
                    onChange={(e) => handleChange('tankType', e.target.value)}
                  >
                    <option value="">選択してください</option>
                    <option value="THIN">薄型</option>
                    <option value="SQUARE">角型</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="hasSpecialSpec"
                    checked={formData.hasSpecialSpec}
                    onChange={(e) => handleChange('hasSpecialSpec', e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <Label htmlFor="hasSpecialSpec" className="cursor-pointer">
                    特殊仕様あり
                  </Label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="materialUnitPrice">部材単価（円）</Label>
                  <Input
                    id="materialUnitPrice"
                    type="number"
                    value={formData.materialUnitPrice}
                    onChange={(e) => handleChange('materialUnitPrice', e.target.value)}
                    placeholder="例: 50000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="highwayFee">高速代（円）</Label>
                  <Input
                    id="highwayFee"
                    type="number"
                    value={formData.highwayFee}
                    onChange={(e) => handleChange('highwayFee', e.target.value)}
                    placeholder="例: 3000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gasolineFee">ガソリン代（円）</Label>
                  <Input
                    id="gasolineFee"
                    type="number"
                    value={formData.gasolineFee}
                    onChange={(e) => handleChange('gasolineFee', e.target.value)}
                    placeholder="例: 2000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="saleType">売却種別（任意）</Label>
                  <select
                    id="saleType"
                    className="w-full h-10 px-3 rounded-md border border-gray-300"
                    value={formData.saleType}
                    onChange={(e) => handleChange('saleType', e.target.value)}
                  >
                    <option value="">選択してください</option>
                    <option value="ECO_CUTE">エコキュート</option>
                    <option value="GAS_WATER_HEATER">ガス給湯器</option>
                    <option value="ELECTRIC_HEATER">電気温水器</option>
                    <option value="OTHER">その他</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="saleFee">売却費（円）（任意）</Label>
                  <Input
                    id="saleFee"
                    type="number"
                    value={formData.saleFee}
                    onChange={(e) => handleChange('saleFee', e.target.value)}
                    placeholder="例: 10000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">メモ</Label>
                <textarea
                  id="notes"
                  className="w-full min-h-[100px] px-3 py-2 rounded-md border border-gray-300"
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="その他のメモを入力してください"
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>
      )}

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          キャンセル
        </Button>
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
