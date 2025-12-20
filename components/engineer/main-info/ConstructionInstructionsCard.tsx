import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ConstructionInstructionsCardProps {
  constructionNotes: string | null
}

export function ConstructionInstructionsCard({ constructionNotes }: ConstructionInstructionsCardProps) {
  if (!constructionNotes) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>施工指示</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap">{constructionNotes}</p>
      </CardContent>
    </Card>
  )
}
