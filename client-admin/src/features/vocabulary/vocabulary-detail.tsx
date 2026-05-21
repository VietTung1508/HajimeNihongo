import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowLeft, Pencil, Volume2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useVocabularyDetail } from '@/hooks/use-vocabulary-detail'
import { VocabularyEditModal } from './vocabulary-edit-modal'

interface Props {
  id: number
}

export default function VocabularyDetail({ id }: Props) {
  const [editOpen, setEditOpen] = useState(false)
  const { data: word, isLoading } = useVocabularyDetail(id)

  if (isLoading) {
    return <div className="py-12 text-center text-muted-foreground">Loading...</div>
  }
  if (!word) {
    return <div className="py-12 text-center text-muted-foreground">Word not found</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/vocabulary" search={{ create: false }}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-baseline gap-3">
            {word.kanji ? (
              <>
                <h1 className="text-3xl font-bold">{word.kanji}</h1>
                <span className="text-xl text-muted-foreground">{word.reading}</span>
              </>
            ) : (
              <h1 className="text-3xl font-bold">{word.reading}</h1>
            )}
          </div>
          <div className="flex gap-2 mt-2">
            {word.jlptLevel != null && <Badge variant="outline">N{word.jlptLevel}</Badge>}
            {word.isCommon && <Badge>Common</Badge>}
          </div>
        </div>
        <Button onClick={() => setEditOpen(true)}>
          <Pencil className="h-4 w-4 mr-2" />Edit
        </Button>
      </div>

      {word.audioUrl && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Volume2 className="h-4 w-4" />
          <audio controls src={word.audioUrl} className="h-8" />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Meanings</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-1">
            {word.meanings.map(m => (
              <li key={m.id} className="text-sm">{m.text}</li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {word.examples.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Examples</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {word.examples.map((ex, i) => (
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

      <VocabularyEditModal wordId={id} open={editOpen} onClose={() => setEditOpen(false)} />
    </div>
  )
}
