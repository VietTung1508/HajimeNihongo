import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowLeft, Pencil } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useGrammarDetail } from '@/hooks/use-grammar-detail'
import { GrammarFormModal } from './grammar-form-modal'

interface Props {
  id: number
}

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  if (value == null || value === '') return null
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-sm">{value}</p>
    </div>
  )
}

export default function GrammarDetail({ id }: Props) {
  const [editOpen, setEditOpen] = useState(false)
  const { data: grammar, isLoading } = useGrammarDetail(id)

  if (isLoading) {
    return <div className="py-12 text-center text-muted-foreground">Loading...</div>
  }
  if (!grammar) {
    return <div className="py-12 text-center text-muted-foreground">Grammar point not found</div>
  }

  const hasDetails = grammar.structure || grammar.structureDisplay || grammar.partOfSpeech ||
    grammar.register || grammar.lessonTitle || grammar.meaningHint || grammar.synonyms || grammar.antonyms

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/grammar">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{grammar.grammarPoint}</h1>
          <p className="text-muted-foreground mt-1">{grammar.meaning}</p>
          <div className="flex gap-2 mt-2">
            <Badge variant="outline">{grammar.level}</Badge>
            {grammar.lessonNumber != null && (
              <Badge variant="secondary">Lesson {grammar.lessonNumber}</Badge>
            )}
          </div>
        </div>
        <Button onClick={() => setEditOpen(true)}>
          <Pencil className="h-4 w-4 mr-2" />Edit
        </Button>
      </div>

      {hasDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <InfoRow label="Structure" value={grammar.structure} />
            <InfoRow label="Structure Display" value={grammar.structureDisplay} />
            <InfoRow label="Part of Speech" value={grammar.partOfSpeech} />
            <InfoRow label="Register" value={grammar.register} />
            <InfoRow label="Lesson Title" value={grammar.lessonTitle} />
            <InfoRow label="Meaning Hint" value={grammar.meaningHint} />
            <InfoRow label="Synonyms" value={grammar.synonyms} />
            <InfoRow label="Antonyms" value={grammar.antonyms} />
          </CardContent>
        </Card>
      )}

      {grammar.about && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{grammar.about}</p>
          </CardContent>
        </Card>
      )}

      {grammar.examples.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Examples</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {grammar.examples.map((ex, i) => (
              <div key={ex.id}>
                {i > 0 && <Separator className="mb-4" />}
                <p className="text-sm font-medium">{ex.sentence}</p>
                <p className="text-sm text-muted-foreground mt-1">{ex.translation}</p>
                {ex.audioUrl && <audio controls src={ex.audioUrl} className="h-8 mt-2" />}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <GrammarFormModal
        mode="edit"
        grammarId={id}
        open={editOpen}
        onClose={() => setEditOpen(false)}
      />
    </div>
  )
}
