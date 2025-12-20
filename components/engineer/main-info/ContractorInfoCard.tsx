import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ContractorInfoCardProps {
  contractorName: string | null
  contractorPhone: string | null
  contractorNotes: string | null
}

export function ContractorInfoCard({ 
  contractorName, 
  contractorPhone, 
  contractorNotes 
}: ContractorInfoCardProps) {
  if (!contractorName && !contractorPhone && !contractorNotes) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>元請け情報</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {contractorName && (
          <div>
            <p className="text-sm text-gray-600">担当者</p>
            <p className="font-medium">{contractorName}</p>
          </div>
        )}
        {contractorPhone && (
          <div>
            <p className="text-sm text-gray-600">TEL</p>
            <p className="font-medium">{contractorPhone}</p>
          </div>
        )}
        {contractorNotes && (
          <div>
            <p className="text-sm text-gray-600">備考欄</p>
            <p className="whitespace-pre-wrap">{contractorNotes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
