import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface DeliveryInfoCardProps {
  deliveryTime: string | null
  deliverySpecification: string | null
  deliveryLocation: string | null
  deliveryNotes: string | null
}

export function DeliveryInfoCard({
  deliveryTime,
  deliverySpecification,
  deliveryLocation,
  deliveryNotes,
}: DeliveryInfoCardProps) {
  if (!deliveryTime && !deliverySpecification && !deliveryLocation) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>配送情報</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          {deliveryTime && (
            <div>
              <p className="text-sm text-gray-600">配送時間</p>
              <p className="font-medium">{deliveryTime}</p>
            </div>
          )}
          {deliverySpecification && (
            <div>
              <p className="text-sm text-gray-600">配送指定</p>
              <p className="font-medium">{deliverySpecification}</p>
            </div>
          )}
          {deliveryLocation && (
            <div>
              <p className="text-sm text-gray-600">搬入場所指定</p>
              <p className="font-medium">{deliveryLocation}</p>
            </div>
          )}
        </div>

        {deliveryNotes && (
          <div>
            <p className="text-sm text-gray-600">備考欄</p>
            <p className="whitespace-pre-wrap">{deliveryNotes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
