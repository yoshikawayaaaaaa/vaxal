import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BUILDING_TYPE_LABELS } from '@/lib/constants'

interface BuildingInfoCardProps {
  roofingDate: Date | null
  demolitionDate: Date | null
  buildingType: string | null
  installationFloor: string | null
  keyboxNumber: string | null
  storageLocation: string | null
  installationLocation: string | null
  parkingSpace: string | null
  buildingNotes: string | null
}

export function BuildingInfoCard({
  roofingDate,
  demolitionDate,
  buildingType,
  installationFloor,
  keyboxNumber,
  storageLocation,
  installationLocation,
  parkingSpace,
  buildingNotes,
}: BuildingInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>建築情報</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {roofingDate && (
            <div>
              <p className="text-sm text-gray-600">上棟日</p>
              <p className="font-medium">
                {new Date(roofingDate).toLocaleDateString('ja-JP')}
              </p>
            </div>
          )}
          {demolitionDate && (
            <div>
              <p className="text-sm text-gray-600">解体日</p>
              <p className="font-medium">
                {new Date(demolitionDate).toLocaleDateString('ja-JP')}
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {buildingType && (
            <div>
              <p className="text-sm text-gray-600">建物区分名</p>
              <p className="font-medium">
                {BUILDING_TYPE_LABELS[buildingType] || 'その他'}
              </p>
            </div>
          )}
          {installationFloor && (
            <div>
              <p className="text-sm text-gray-600">設置階数</p>
              <p className="font-medium">{installationFloor}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {keyboxNumber && (
            <div>
              <p className="text-sm text-gray-600">キーボックスNo</p>
              <p className="font-medium">{keyboxNumber}</p>
            </div>
          )}
          {storageLocation && (
            <div>
              <p className="text-sm text-gray-600">保管場所</p>
              <p className="font-medium">{storageLocation}</p>
            </div>
          )}
        </div>

        {installationLocation && (
          <div>
            <p className="text-sm text-gray-600">設置場所</p>
            <p className="whitespace-pre-wrap">{installationLocation}</p>
          </div>
        )}

        {parkingSpace && (
          <div>
            <p className="text-sm text-gray-600">駐車スペース</p>
            <p className="whitespace-pre-wrap">{parkingSpace}</p>
          </div>
        )}

        {buildingNotes && (
          <div>
            <p className="text-sm text-gray-600">備考欄</p>
            <p className="whitespace-pre-wrap">{buildingNotes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
