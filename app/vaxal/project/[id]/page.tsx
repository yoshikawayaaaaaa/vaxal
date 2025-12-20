'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProjectDetailTabs } from '@/components/project/project-detail-tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Project {
  id: string
  projectNumber: string
  siteName: string
  siteAddress: string
  customerName: string
  customerBirthDate: string
  applicantRelationship: string | null
  customerAddress: string
  customerPhone: string
  firstInquiryDate: string
  workContent: string
  workType: string
  workTime: string
  buildingType: string | null
  overview: string | null
  productSetNumber: string | null
  productTankNumber: string | null
  productHeatPumpNumber: string | null
  productRemoteNumber: string | null
  productBaseNumber: string | null
  productFallNumber: string | null
  productUlbroNumber: string | null
  productOtherNumber: string | null
  paymentAmount: number | null
  contractAmount: number | null
  productWarranty: boolean
  warrantyPeriod: string | null
  paymentMethod: string | null
  subsidyAmount: number | null
  sellingPrice: number | null
  sellingPrice2: number | null
  sellingPrice3: number | null
  costPrice: number | null
  hasHandMoney: boolean
  handMoneyAmount: number | null
  hasRemoteTravelFee: boolean
  remoteTravelDistance: number | null
  remoteTravelFee: number | null
  idCardRequired: boolean
  idCardObtained: boolean
  bankbookRequired: boolean
  bankbookObtained: boolean
  additionalWork: string | null
  existingProductInfo: string | null
  constructionNotes: string | null
  workDate: string | null
  receptionDate: string | null
  orderDate: string | null
  expectedCompletionDate: string | null
  completionDate: string | null
  firstContactMethod: string | null
  communicationTool: string | null
  internalNotes: string | null
  revisitType: string | null
  revisitDateTime: string | null
  revisitCount: number | null
  crossSellContent: string | null
  assignedEngineerId: string | null
  createdByVaxal: {
    name: string
    email: string
  }
  assignedEngineer: {
    name: string
    email: string
  } | null
}

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const [projectId, setProjectId] = useState<string>('')
  const [project, setProject] = useState<Project | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<Project>>({})

  useEffect(() => {
    params.then(({ id }) => {
      setProjectId(id)
      fetchProject(id)
    })
  }, [])

  const fetchProject = async (id: string) => {
    try {
      const response = await fetch(`/api/vaxal/projects/${id}`)
      if (!response.ok) throw new Error('Failed to fetch project')
      const data = await response.json()
      setProject(data)
      setFormData(data)
    } catch (error) {
      console.error('Error fetching project:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!projectId) return
    
    setIsSaving(true)
    try {
      const response = await fetch(`/api/vaxal/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Failed to update project')

      const updatedProject = await response.json()
      setProject(updatedProject)
      setFormData(updatedProject)
      setIsEditing(false)
      alert('保存しました')
    } catch (error) {
      console.error('Error updating project:', error)
      alert('保存に失敗しました')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData(project || {})
    setIsEditing(false)
  }

  if (isLoading) {
    return <div className="p-8">読み込み中...</div>
  }

  if (!project) {
    return <div className="p-8">プロジェクトが見つかりません</div>
  }

  const workContentLabels: Record<string, string> = {
    ECO_CUTE: 'エコキュート',
    GAS_WATER_HEATER: 'ガス給湯器',
    ELECTRIC_HEATER: '電気温水器',
    BATHROOM_DRYER: '浴室乾燥機',
    SOLAR_PANEL: '太陽光パネル',
    OTHER: 'その他',
  }

  const workTypeLabels: Record<string, string> = {
    NEW_INSTALLATION: '新設',
    REFORM: 'リフォーム',
    REPLACEMENT: '交換',
  }

  const paymentMethodLabels: Record<string, string> = {
    CASH: '現金',
    CARD: 'カード',
    LOAN: 'ローン',
    BANK_TRANSFER: '銀行振込',
    ELECTRONIC_MONEY: '電子マネー',
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">案件詳細</h1>
            <p className="text-gray-600 mt-2">案件番号: {project.projectNumber}</p>
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-blue-700">
                編集
              </Button>
            ) : (
              <>
                <Button onClick={handleCancel} variant="outline">
                  キャンセル
                </Button>
                <Button onClick={handleSave} disabled={isSaving} className="bg-green-600 hover:bg-green-700">
                  {isSaving ? '保存中...' : '保存'}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* タブナビゲーション */}
        <ProjectDetailTabs projectId={projectId} activeTab="basic" />

        {/* 施工主基本情報 */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">施工主基本情報</h2>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="grid grid-cols-2 gap-x-12 gap-y-6">
              <div>
                <div className="mb-4">
                  <Label className="text-sm text-gray-600 mb-1">現場名</Label>
                  {isEditing ? (
                    <Input
                      value={formData.siteName || ''}
                      onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-base font-medium">{project.siteName}</p>
                  )}
                </div>
                <div className="mb-4">
                  <Label className="text-sm text-gray-600 mb-1">名前</Label>
                  {isEditing ? (
                    <Input
                      value={formData.customerName || ''}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-base font-medium">{project.customerName}</p>
                  )}
                </div>
                <div className="mb-4">
                  <Label className="text-sm text-gray-600 mb-1">電話番号</Label>
                  {isEditing ? (
                    <Input
                      value={formData.customerPhone || ''}
                      onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-base font-medium">{project.customerPhone}</p>
                  )}
                </div>
              </div>

              <div>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">案件番号</p>
                  <p className="text-base font-medium">{project.projectNumber}</p>
                </div>
                <div className="mb-4">
                  <Label className="text-sm text-gray-600 mb-1">現場住所</Label>
                  {isEditing ? (
                    <Input
                      value={formData.siteAddress || ''}
                      onChange={(e) => setFormData({ ...formData, siteAddress: e.target.value })}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-base font-medium">{project.siteAddress}</p>
                  )}
                </div>
                <div className="mb-4">
                  <Label className="text-sm text-gray-600 mb-1">住所</Label>
                  {isEditing ? (
                    <Input
                      value={formData.customerAddress || ''}
                      onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-base font-medium">{project.customerAddress}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Label className="text-sm text-gray-600 mb-1">概要</Label>
              {isEditing ? (
                <textarea
                  value={formData.overview || ''}
                  onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                  className="mt-1 w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md"
                />
              ) : (
                <p className="text-base">{project.overview || '-'}</p>
              )}
            </div>
          </div>
        </section>

        {/* 工事情報 */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">工事情報</h2>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="grid grid-cols-2 gap-x-12 gap-y-4">
              <div>
                <Label className="text-sm text-gray-600 mb-1">工事内容</Label>
                {isEditing ? (
                  <select
                    value={formData.workContent || ''}
                    onChange={(e) => setFormData({ ...formData, workContent: e.target.value })}
                    className="mt-1 w-full h-10 px-3 rounded-md border border-gray-300"
                  >
                    {Object.entries(workContentLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-base">{workContentLabels[project.workContent]}</p>
                )}
              </div>
              <div>
                <Label className="text-sm text-gray-600 mb-1">用途</Label>
                {isEditing ? (
                  <select
                    value={formData.workType || ''}
                    onChange={(e) => setFormData({ ...formData, workType: e.target.value })}
                    className="mt-1 w-full h-10 px-3 rounded-md border border-gray-300"
                  >
                    {Object.entries(workTypeLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-base">{workTypeLabels[project.workType]}</p>
                )}
              </div>
              <div>
                <Label className="text-sm text-gray-600 mb-1">施工時間</Label>
                {isEditing ? (
                  <Input
                    value={formData.workTime || ''}
                    onChange={(e) => setFormData({ ...formData, workTime: e.target.value })}
                    className="mt-1"
                  />
                ) : (
                  <p className="text-base">{project.workTime}</p>
                )}
              </div>
              {project.buildingType && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">建物区分名</p>
                  <p className="text-base">
                    {project.buildingType === 'DETACHED_HOUSE' && '戸建て'}
                    {project.buildingType === 'MANSION' && 'マンション'}
                    {project.buildingType === 'APARTMENT' && 'アパート'}
                    {project.buildingType === 'OTHER' && 'その他'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 商品情報 */}
        {project.workContent === 'ECO_CUTE' && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">商品情報</h2>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                <div>
                  <Label className="text-sm text-gray-600 mb-1">セット品番</Label>
                  {isEditing ? (
                    <Input
                      value={formData.productSetNumber || ''}
                      onChange={(e) => setFormData({ ...formData, productSetNumber: e.target.value })}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-base">{project.productSetNumber || '-'}</p>
                  )}
                </div>
                <div>
                  <Label className="text-sm text-gray-600 mb-1">タンク品番</Label>
                  {isEditing ? (
                    <Input
                      value={formData.productTankNumber || ''}
                      onChange={(e) => setFormData({ ...formData, productTankNumber: e.target.value })}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-base">{project.productTankNumber || '-'}</p>
                  )}
                </div>
                <div>
                  <Label className="text-sm text-gray-600 mb-1">ヒートポンプ品番</Label>
                  {isEditing ? (
                    <Input
                      value={formData.productHeatPumpNumber || ''}
                      onChange={(e) => setFormData({ ...formData, productHeatPumpNumber: e.target.value })}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-base">{project.productHeatPumpNumber || '-'}</p>
                  )}
                </div>
                <div>
                  <Label className="text-sm text-gray-600 mb-1">リモコン品番</Label>
                  {isEditing ? (
                    <Input
                      value={formData.productRemoteNumber || ''}
                      onChange={(e) => setFormData({ ...formData, productRemoteNumber: e.target.value })}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-base">{project.productRemoteNumber || '-'}</p>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* お支払い情報 */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">お支払い情報</h2>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="grid grid-cols-2 gap-x-12 gap-y-4">
              <div>
                <Label className="text-sm text-gray-600 mb-1">金額</Label>
                {isEditing ? (
                  <Input
                    type="number"
                    value={formData.paymentAmount || ''}
                    onChange={(e) => setFormData({ ...formData, paymentAmount: parseInt(e.target.value) || null })}
                    className="mt-1"
                  />
                ) : (
                  <p className="text-base">{project.paymentAmount ? `¥${project.paymentAmount.toLocaleString()}` : '-'}</p>
                )}
              </div>
              <div>
                <Label className="text-sm text-gray-600 mb-1">請負金額</Label>
                {isEditing ? (
                  <Input
                    type="number"
                    value={formData.contractAmount || ''}
                    onChange={(e) => setFormData({ ...formData, contractAmount: parseInt(e.target.value) || null })}
                    className="mt-1"
                  />
                ) : (
                  <p className="text-base font-bold text-blue-600">
                    {project.contractAmount !== null ? `¥${project.contractAmount.toLocaleString()}` : '-'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* メモ */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">メモ</h2>
          
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <div>
              <Label className="text-sm text-gray-600 mb-1">追加工事</Label>
              {isEditing ? (
                <textarea
                  value={formData.additionalWork || ''}
                  onChange={(e) => setFormData({ ...formData, additionalWork: e.target.value })}
                  className="mt-1 w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md"
                />
              ) : (
                <p className="text-base whitespace-pre-wrap">{project.additionalWork || '-'}</p>
              )}
            </div>
            <div>
              <Label className="text-sm text-gray-600 mb-1">既存商品情報</Label>
              {isEditing ? (
                <textarea
                  value={formData.existingProductInfo || ''}
                  onChange={(e) => setFormData({ ...formData, existingProductInfo: e.target.value })}
                  className="mt-1 w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md"
                />
              ) : (
                <p className="text-base whitespace-pre-wrap">{project.existingProductInfo || '-'}</p>
              )}
            </div>
            <div>
              <Label className="text-sm text-gray-600 mb-1">施工指示</Label>
              {isEditing ? (
                <textarea
                  value={formData.constructionNotes || ''}
                  onChange={(e) => setFormData({ ...formData, constructionNotes: e.target.value })}
                  className="mt-1 w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md"
                />
              ) : (
                <p className="text-base whitespace-pre-wrap">{project.constructionNotes || '-'}</p>
              )}
            </div>
          </div>
        </section>

        {/* 日程 */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">日程</h2>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="grid grid-cols-2 gap-x-12 gap-y-4">
              <div>
                <Label className="text-sm text-gray-600 mb-1">工事日</Label>
                {isEditing ? (
                  <Input
                    type="date"
                    value={formData.workDate ? new Date(formData.workDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => setFormData({ ...formData, workDate: e.target.value })}
                    className="mt-1"
                  />
                ) : (
                  <p className="text-base">{project.workDate ? new Date(project.workDate).toLocaleDateString('ja-JP') : '-'}</p>
                )}
              </div>
              <div>
                <Label className="text-sm text-gray-600 mb-1">受付日</Label>
                {isEditing ? (
                  <Input
                    type="date"
                    value={formData.receptionDate ? new Date(formData.receptionDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => setFormData({ ...formData, receptionDate: e.target.value })}
                    className="mt-1"
                  />
                ) : (
                  <p className="text-base">{project.receptionDate ? new Date(project.receptionDate).toLocaleDateString('ja-JP') : '-'}</p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 社内メモ（VAXAL専用） */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">社内メモ（VAXAL専用）</h2>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg shadow-sm p-6">
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-gray-600 mb-1">ファーストコンタクトの連絡手段</Label>
                {isEditing ? (
                  <Input
                    value={formData.firstContactMethod || ''}
                    onChange={(e) => setFormData({ ...formData, firstContactMethod: e.target.value })}
                    className="mt-1"
                  />
                ) : (
                  <p className="text-base">{project.firstContactMethod || '-'}</p>
                )}
              </div>
              <div>
                <Label className="text-sm text-gray-600 mb-1">連絡ツール</Label>
                {isEditing ? (
                  <textarea
                    value={formData.communicationTool || ''}
                    onChange={(e) => setFormData({ ...formData, communicationTool: e.target.value })}
                    className="mt-1 w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md"
                  />
                ) : (
                  <p className="text-base whitespace-pre-wrap">{project.communicationTool || '-'}</p>
                )}
              </div>
              <div>
                <Label className="text-sm text-gray-600 mb-1">備考欄</Label>
                {isEditing ? (
                  <textarea
                    value={formData.internalNotes || ''}
                    onChange={(e) => setFormData({ ...formData, internalNotes: e.target.value })}
                    className="mt-1 w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md"
                  />
                ) : (
                  <p className="text-base whitespace-pre-wrap">{project.internalNotes || '-'}</p>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
