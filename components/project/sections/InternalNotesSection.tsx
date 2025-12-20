import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface InternalNotesSectionProps {
  project: any
  formData: any
  isEditing: boolean
  onUpdate: (data: any) => void
}

export function InternalNotesSection({ project, formData, isEditing, onUpdate }: InternalNotesSectionProps) {
  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">社内メモ（VAXAL専用）</h2>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg shadow-sm p-6">
        <div className="space-y-4">
          <div>
            <Label className="text-sm text-gray-600 mb-1">ファーストコンタクトの連絡手段</Label>
            {isEditing ? (
              <Input
                value={formData.firstContactMethod || ''}
                onChange={(e) => onUpdate({ ...formData, firstContactMethod: e.target.value })}
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
                onChange={(e) => onUpdate({ ...formData, communicationTool: e.target.value })}
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
                onChange={(e) => onUpdate({ ...formData, internalNotes: e.target.value })}
                className="mt-1 w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md"
              />
            ) : (
              <p className="text-base whitespace-pre-wrap">{project.internalNotes || '-'}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
