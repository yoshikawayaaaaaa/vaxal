import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ConstructionInstructionsCardProps {
  constructionNotes: string | null
}

export function ConstructionInstructionsCard({ constructionNotes }: ConstructionInstructionsCardProps) {
  if (!constructionNotes) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">施工指示</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm md:text-base whitespace-pre-wrap">{constructionNotes}</p>
      </CardContent>
    </Card>
  )
}
