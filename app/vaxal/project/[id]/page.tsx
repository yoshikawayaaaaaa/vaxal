'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProjectDetailTabs } from '@/components/project/project-detail-tabs'
import { Button } from '@/components/ui/button'
import { BasicInfoSection } from '@/components/project/sections/BasicInfoSection'
import { WorkInfoSection } from '@/components/project/sections/WorkInfoSection'
import { ProductInfoSection } from '@/components/project/sections/ProductInfoSection'
import { PaymentInfoSection } from '@/components/project/sections/PaymentInfoSection'
import { NotesSection } from '@/components/project/sections/NotesSection'
import { ScheduleSection } from '@/components/project/sections/ScheduleSection'
import { InternalNotesSection } from '@/components/project/sections/InternalNotesSection'

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

        {/* 各セクション */}
        <BasicInfoSection 
          project={project} 
          formData={formData} 
          isEditing={isEditing} 
          onUpdate={setFormData} 
        />
        
        <WorkInfoSection 
          project={project} 
          formData={formData} 
          isEditing={isEditing} 
          onUpdate={setFormData} 
        />
        
        <ProductInfoSection 
          project={project} 
          formData={formData} 
          isEditing={isEditing} 
          onUpdate={setFormData} 
        />
        
        <PaymentInfoSection 
          project={project} 
          formData={formData} 
          isEditing={isEditing} 
          onUpdate={setFormData} 
        />
        
        <NotesSection 
          project={project} 
          formData={formData} 
          isEditing={isEditing} 
          onUpdate={setFormData} 
        />
        
        <ScheduleSection 
          project={project} 
          formData={formData} 
          isEditing={isEditing} 
          onUpdate={setFormData} 
        />
        
        <InternalNotesSection 
          project={project} 
          formData={formData} 
          isEditing={isEditing} 
          onUpdate={setFormData} 
        />
      </div>
    </div>
  )
}
