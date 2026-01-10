import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface VaxalStaffCardProps {
  receptionStaff: string | null
  receptionStaffPhone: string | null
  salesStaff: string | null
  salesStaffPhone: string | null
  constructionStaff: string | null
  constructionStaffPhone: string | null
  staffNotes: string | null
}

export function VaxalStaffCard({
  receptionStaff,
  receptionStaffPhone,
  salesStaff,
  salesStaffPhone,
  constructionStaff,
  constructionStaffPhone,
  staffNotes,
}: VaxalStaffCardProps) {
  if (!receptionStaff && !salesStaff && !constructionStaff) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">VAXAL担当者情報</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 受付担当者 */}
        {(receptionStaff || receptionStaffPhone) && (
          <div className="pb-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold mb-3">受付担当者</h3>
            <div className="grid grid-cols-2 gap-4">
              {receptionStaff && (
                <div>
                  <p className="text-sm text-gray-600">担当者名</p>
                  <p className="font-medium">{receptionStaff}</p>
                </div>
              )}
              {receptionStaffPhone && (
                <div>
                  <p className="text-sm text-gray-600">TEL</p>
                  <p className="font-medium">{receptionStaffPhone}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 営業担当者 */}
        {(salesStaff || salesStaffPhone) && (
          <div className="pb-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold mb-3">営業担当者</h3>
            <div className="grid grid-cols-2 gap-4">
              {salesStaff && (
                <div>
                  <p className="text-sm text-gray-600">担当者名</p>
                  <p className="font-medium">{salesStaff}</p>
                </div>
              )}
              {salesStaffPhone && (
                <div>
                  <p className="text-sm text-gray-600">TEL</p>
                  <p className="font-medium">{salesStaffPhone}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 工務担当者 */}
        {(constructionStaff || constructionStaffPhone) && (
          <div className="pb-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold mb-3">工務担当者</h3>
            <div className="grid grid-cols-2 gap-4">
              {constructionStaff && (
                <div>
                  <p className="text-sm text-gray-600">担当者名</p>
                  <p className="font-medium">{constructionStaff}</p>
                </div>
              )}
              {constructionStaffPhone && (
                <div>
                  <p className="text-sm text-gray-600">TEL</p>
                  <p className="font-medium">{constructionStaffPhone}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {staffNotes && (
          <div>
            <p className="text-sm text-gray-600">備考欄</p>
            <p className="whitespace-pre-wrap">{staffNotes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
