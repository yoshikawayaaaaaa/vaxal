import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ScheduleSectionProps {
  project: any
  formData: any
  isEditing: boolean
  onUpdate: (data: any) => void
}

export function ScheduleSection({ project, formData, isEditing, onUpdate }: ScheduleSectionProps) {
  return (
    <section className="mb-4 md:mb-6 md:mb-8">
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">日程</h2>
      
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
          <div>
            <Label className="text-sm text-gray-600 mb-1">工事日</Label>
            {isEditing ? (
              <Input
                type="date"
                value={formData.workDate ? new Date(formData.workDate).toISOString().split('T')[0] : ''}
                onChange={(e) => onUpdate({ ...formData, workDate: e.target.value })}
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
                onChange={(e) => onUpdate({ ...formData, receptionDate: e.target.value })}
                className="mt-1"
              />
            ) : (
              <p className="text-base">{project.receptionDate ? new Date(project.receptionDate).toLocaleDateString('ja-JP') : '-'}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
