import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ProductInfoSectionProps {
  project: any
  formData: any
  isEditing: boolean
  onUpdate: (data: any) => void
}

export function ProductInfoSection({ project, formData, isEditing, onUpdate }: ProductInfoSectionProps) {
  // エコキュート以外の場合は表示しない
  if (project.workContent !== 'ECO_CUTE') {
    return null
  }

  return (
    <section className="mb-4 md:mb-6 md:mb-8">
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">商品情報</h2>
      
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
          <div>
            <Label className="text-sm text-gray-600 mb-1">セット品番</Label>
            {isEditing ? (
              <Input
                value={formData.productSetNumber || ''}
                onChange={(e) => onUpdate({ ...formData, productSetNumber: e.target.value })}
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
                onChange={(e) => onUpdate({ ...formData, productTankNumber: e.target.value })}
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
                onChange={(e) => onUpdate({ ...formData, productHeatPumpNumber: e.target.value })}
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
                onChange={(e) => onUpdate({ ...formData, productRemoteNumber: e.target.value })}
                className="mt-1"
              />
            ) : (
              <p className="text-base">{project.productRemoteNumber || '-'}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
