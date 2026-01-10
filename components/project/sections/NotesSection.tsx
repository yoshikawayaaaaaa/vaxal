import { Label } from '@/components/ui/label'

interface NotesSectionProps {
  project: any
  formData: any
  isEditing: boolean
  onUpdate: (data: any) => void
}

export function NotesSection({ project, formData, isEditing, onUpdate }: NotesSectionProps) {
  return (
    <section className="mb-4 md:mb-6 md:mb-8">
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">メモ</h2>
      
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 space-y-4">
        <div>
          <Label className="text-sm text-gray-600 mb-1">追加工事</Label>
          {isEditing ? (
            <textarea
              value={formData.additionalWork || ''}
              onChange={(e) => onUpdate({ ...formData, additionalWork: e.target.value })}
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
              onChange={(e) => onUpdate({ ...formData, existingProductInfo: e.target.value })}
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
              onChange={(e) => onUpdate({ ...formData, constructionNotes: e.target.value })}
              className="mt-1 w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md"
            />
          ) : (
            <p className="text-base whitespace-pre-wrap">{project.constructionNotes || '-'}</p>
          )}
        </div>
      </div>
    </section>
  )
}
