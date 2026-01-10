import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface PaymentInfoSectionProps {
  project: any
  formData: any
  isEditing: boolean
  onUpdate: (data: any) => void
}

export function PaymentInfoSection({ project, formData, isEditing, onUpdate }: PaymentInfoSectionProps) {
  return (
    <section className="mb-4 md:mb-6 md:mb-8">
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">お支払い情報</h2>
      
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
          <div>
            <Label className="text-sm text-gray-600 mb-1">金額</Label>
            {isEditing ? (
              <Input
                type="number"
                value={formData.paymentAmount || ''}
                onChange={(e) => onUpdate({ ...formData, paymentAmount: parseInt(e.target.value) || null })}
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
                onChange={(e) => onUpdate({ ...formData, contractAmount: parseInt(e.target.value) || null })}
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
  )
}
