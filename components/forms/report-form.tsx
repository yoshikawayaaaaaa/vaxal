'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ReportFormProps {
  projectId: string
  projectNumber: string
}

type TabId = 'SITE_SURVEY' | 'PICKUP' | 'CHECK_IN' | 'COMPLETION' | 'UNLOADING' | 'ENGINEER_INFO'

interface ImageData {
  files: File[]
  previews: string[]
}

export function ReportForm({ projectId, projectNumber }: ReportFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<TabId>('SITE_SURVEY')

  // 各報告タイプの画像を管理
  const [images, setImages] = useState<Record<string, ImageData>>({
    SITE_SURVEY: { files: [], previews: [] },
    PICKUP: { files: [], previews: [] },
    CHECK_IN: { files: [], previews: [] },
    COMPLETION: { files: [], previews: [] },
    UNLOADING: { files: [], previews: [] },
  })

  const [formData, setFormData] = useState({
    pickupMaterials: '',
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
    { id: 'ENGINEER_INFO' as const, label: 'エンジニア入力情報' },
  ]

  const handleImageChange = (reportType: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    const newPreviews: string[] = []
    let loadedCount = 0

    files.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        newPreviews.push(reader.result as string)
        loadedCount++
        
        if (loadedCount === files.length) {
          setImages((prev) => ({
            ...prev,
            [reportType]: {
              files: [...prev[reportType].files, ...files],
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
      // FormDataを作成
      const submitData = new FormData()
      
      // プロジェクトIDを追加
      submitData.append('projectId', projectId)
      
      // エンジニア入力情報を追加
      submitData.append('pickupMaterials', formData.pickupMaterials)
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
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.label}
              {tab.id !== 'ENGINEER_INFO' && images[tab.id]?.files.length > 0 && (
                <span className="ml-2 bg-blue-100 text-blue-600 py-0.5 px-2 rounded-full text-xs">
                  {images[tab.id].files.length}
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
              <div className="space-y-2">
                <Label htmlFor="pickupMaterials">持ち出し部材</Label>
                <textarea
                  id="pickupMaterials"
                  className="w-full min-h-[80px] px-3 py-2 rounded-md border border-gray-300"
                  value={formData.pickupMaterials}
                  onChange={(e) => handleChange('pickupMaterials', e.target.value)}
                  placeholder="持ち出した部材を入力してください"
                />
              </div>

              <div className="space-y-2">
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

        {/* エンジニア入力情報 */}
        {activeTab === 'ENGINEER_INFO' && (
          <Card>
            <CardHeader>
              <CardTitle>エンジニア入力情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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

              <div className="grid grid-cols-2 gap-4">
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

              <div className="grid grid-cols-2 gap-4">
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

              <div className="grid grid-cols-3 gap-4">
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

              <div className="grid grid-cols-2 gap-4">
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
