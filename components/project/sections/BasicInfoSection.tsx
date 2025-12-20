import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface BasicInfoSectionProps {
  project: any
  formData: any
  isEditing: boolean
  onUpdate: (data: any) => void
}

export function BasicInfoSection({ project, formData, isEditing, onUpdate }: BasicInfoSectionProps) {
  return (
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
                  onChange={(e) => onUpdate({ ...formData, siteName: e.target.value })}
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
                  onChange={(e) => onUpdate({ ...formData, customerName: e.target.value })}
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
                  onChange={(e) => onUpdate({ ...formData, customerPhone: e.target.value })}
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
                  onChange={(e) => onUpdate({ ...formData, siteAddress: e.target.value })}
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
                  onChange={(e) => onUpdate({ ...formData, customerAddress: e.target.value })}
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
              onChange={(e) => onUpdate({ ...formData, overview: e.target.value })}
              className="mt-1 w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md"
            />
          ) : (
            <p className="text-base">{project.overview || '-'}</p>
          )}
        </div>
      </div>
    </section>
  )
}
