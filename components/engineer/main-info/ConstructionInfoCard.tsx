import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ConstructionInfoCardProps {
  constructionDate: Date | null
  constructionCompany: string | null
  constructionStaffName: string | null
  constructionPhone: string | null
  constructionEmail: string | null
  remainingWorkDate: Date | null
  constructionInfoNotes: string | null
}

export function ConstructionInfoCard({
  constructionDate,
  constructionCompany,
  constructionStaffName,
  constructionPhone,
  constructionEmail,
  remainingWorkDate,
  constructionInfoNotes,
}: ConstructionInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>施工情報</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {constructionDate && (
            <div>
              <p className="text-sm text-gray-600">施工日</p>
              <p className="font-medium">
                {new Date(constructionDate).toLocaleDateString('ja-JP')}
              </p>
            </div>
          )}
          {constructionCompany && (
            <div>
              <p className="text-sm text-gray-600">施工会社</p>
              <p className="font-medium">{constructionCompany}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {constructionStaffName && (
            <div>
              <p className="text-sm text-gray-600">施工担当者名</p>
              <p className="font-medium">{constructionStaffName}</p>
            </div>
          )}
          {constructionPhone && (
            <div>
              <p className="text-sm text-gray-600">TEL</p>
              <p className="font-medium">{constructionPhone}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {constructionEmail && (
            <div>
              <p className="text-sm text-gray-600">E-mail</p>
              <p className="font-medium">{constructionEmail}</p>
            </div>
          )}
          {remainingWorkDate && (
            <div>
              <p className="text-sm text-gray-600">残工事日</p>
              <p className="font-medium">
                {new Date(remainingWorkDate).toLocaleDateString('ja-JP')}
              </p>
            </div>
          )}
        </div>

        {constructionInfoNotes && (
          <div>
            <p className="text-sm text-gray-600">備考欄</p>
            <p className="whitespace-pre-wrap">{constructionInfoNotes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
