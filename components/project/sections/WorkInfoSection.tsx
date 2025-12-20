import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface WorkInfoSectionProps {
  project: any
  formData: any
  isEditing: boolean
  onUpdate: (data: any) => void
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

const buildingTypeLabels: Record<string, string> = {
  DETACHED_HOUSE: '戸建て',
  MANSION: 'マンション',
  APARTMENT: 'アパート',
  OTHER: 'その他',
}

export function WorkInfoSection({ project, formData, isEditing, onUpdate }: WorkInfoSectionProps) {
  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">工事情報</h2>
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-2 gap-x-12 gap-y-4">
          <div>
            <Label className="text-sm text-gray-600 mb-1">工事内容</Label>
            {isEditing ? (
              <select
                value={formData.workContent || ''}
                onChange={(e) => onUpdate({ ...formData, workContent: e.target.value })}
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
                onChange={(e) => onUpdate({ ...formData, workType: e.target.value })}
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
              <p className="text-base">{buildingTypeLabels[project.buildingType] || project.buildingType}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
