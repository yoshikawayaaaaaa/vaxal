import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { WORK_CONTENT_LABELS, WORK_TYPE_LABELS, BUILDING_TYPE_LABELS } from '@/lib/constants'

interface WorkInfoSectionProps {
  project: any
  formData: any
  isEditing: boolean
  onUpdate: (data: any) => void
}

export function WorkInfoSection({ project, formData, isEditing, onUpdate }: WorkInfoSectionProps) {
  return (
    <section className="mb-4 md:mb-6 md:mb-8">
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">工事情報</h2>
      
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
          <div>
            <Label className="text-sm text-gray-600 mb-1">工事内容</Label>
            {isEditing ? (
              <select
                value={formData.workContent || ''}
                onChange={(e) => onUpdate({ ...formData, workContent: e.target.value })}
                className="mt-1 w-full h-10 px-3 rounded-md border border-gray-300"
              >
                {Object.entries(WORK_CONTENT_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            ) : (
              <p className="text-base">{WORK_CONTENT_LABELS[project.workContent]}</p>
            )}
          </div>
          <div>
            <Label className="text-sm text-gray-600 mb-1">用途</Label>
            {isEditing ? (
              <select
                value={formData.workType || ''}
                onChange={(e) => onUpdate({ ...formData, workType: e.target.value })}
                className="mt-1 w-full h-10 px-3 rounded-md border border-gray-300"
              >
                {Object.entries(WORK_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            ) : (
              <p className="text-base">{WORK_TYPE_LABELS[project.workType]}</p>
            )}
          </div>
          <div>
            <Label className="text-sm text-gray-600 mb-1">施工時間</Label>
            {isEditing ? (
              <Input
                value={formData.workTime || ''}
                onChange={(e) => onUpdate({ ...formData, workTime: e.target.value })}
                className="mt-1"
              />
            ) : (
              <p className="text-base">{project.workTime}</p>
            )}
          </div>
          {project.buildingType && (
            <div>
              <p className="text-sm text-gray-600 mb-1">建物区分名</p>
              <p className="text-base">{BUILDING_TYPE_LABELS[project.buildingType] || project.buildingType}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
