import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ProductInfoCardProps {
  productCategory: string | null
  productSeries: string | null
  deliveryDate: Date | null
  shipmentDate: Date | null
  productNotes: string | null
}

export function ProductInfoCard({
  productCategory,
  productSeries,
  deliveryDate,
  shipmentDate,
  productNotes,
}: ProductInfoCardProps) {
  if (!productCategory && !productSeries && !deliveryDate && !shipmentDate) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>商品情報</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {productCategory && (
            <div>
              <p className="text-sm text-gray-600">機種区分</p>
              <p className="font-medium">{productCategory}</p>
            </div>
          )}
          {productSeries && (
            <div>
              <p className="text-sm text-gray-600">シリーズ名</p>
              <p className="font-medium">{productSeries}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {deliveryDate && (
            <div>
              <p className="text-sm text-gray-600">荷受け日</p>
              <p className="font-medium">
                {new Date(deliveryDate).toLocaleDateString('ja-JP')}
              </p>
            </div>
          )}
          {shipmentDate && (
            <div>
              <p className="text-sm text-gray-600">出荷日</p>
              <p className="font-medium">
                {new Date(shipmentDate).toLocaleDateString('ja-JP')}
              </p>
            </div>
          )}
        </div>

        {productNotes && (
          <div>
            <p className="text-sm text-gray-600">備考欄</p>
            <p className="whitespace-pre-wrap">{productNotes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
