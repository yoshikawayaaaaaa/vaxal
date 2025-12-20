import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface SurveyInfoCardProps {
  surveyRequestDate: Date | null
  surveyDate: Date | null
  surveyTime: string | null
  surveyCompany: string | null
  surveyStaff: string | null
  reSurveyDate: Date | null
  surveyNotes: string | null
}

export function SurveyInfoCard({
  surveyRequestDate,
  surveyDate,
  surveyTime,
  surveyCompany,
  surveyStaff,
  reSurveyDate,
  surveyNotes,
}: SurveyInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>現場調査情報</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {surveyRequestDate && (
            <div>
              <p className="text-sm text-gray-600">現場調査希望日</p>
              <p className="font-medium">
                {new Date(surveyRequestDate).toLocaleDateString('ja-JP')}
              </p>
            </div>
          )}
          {surveyDate && (
            <div>
              <p className="text-sm text-gray-600">現場調査日（完了後）</p>
              <p className="font-medium">
                {new Date(surveyDate).toLocaleDateString('ja-JP')}
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {surveyTime && (
            <div>
              <p className="text-sm text-gray-600">現場調査時間（完了後）</p>
              <p className="font-medium">{surveyTime}</p>
            </div>
          )}
          {surveyCompany && (
            <div>
              <p className="text-sm text-gray-600">管理業者名</p>
              <p className="font-medium">{surveyCompany}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {surveyStaff && (
            <div>
              <p className="text-sm text-gray-600">現場調査実施者</p>
              <p className="font-medium">{surveyStaff}</p>
            </div>
          )}
          {reSurveyDate && (
            <div>
              <p className="text-sm text-gray-600">再現場調査日</p>
              <p className="font-medium">
                {new Date(reSurveyDate).toLocaleDateString('ja-JP')}
              </p>
            </div>
          )}
        </div>

        {surveyNotes && (
          <div>
            <p className="text-sm text-gray-600">備考欄</p>
            <p className="whitespace-pre-wrap">{surveyNotes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
