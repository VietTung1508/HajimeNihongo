import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { adminVocabularyApi } from '@/lib/api/admin-vocabulary-api'
import type { VocabDetail } from '@/types/vocabulary'

interface Props {
  wordId: number
  detail: VocabDetail
  canWrite: boolean
}

export function VocabularyEditSections({ wordId, detail, canWrite }: Props) {
  const qc = useQueryClient()
  const [newMeaning, setNewMeaning] = useState('')
  const [newExample, setNewExample] = useState({ sentence: '', translation: '' })
  const [editMeaning, setEditMeaning] = useState<{ id: number; text: string } | null>(null)
  const [editExample, setEditExample] = useState<{ id: number; sentence: string; translation: string } | null>(null)

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin-vocabulary-detail', wordId] })

  const addMeaningMutation = useMutation({
    mutationFn: () => adminVocabularyApi.addMeaning(wordId, newMeaning.trim()),
    onSuccess: () => { invalidate(); setNewMeaning(''); toast.success('Meaning added') },
    onError: () => toast.error('Failed to add meaning'),
  })

  const updateMeaningMutation = useMutation({
    mutationFn: ({ id, text }: { id: number; text: string }) => adminVocabularyApi.updateMeaning(wordId, id, text),
    onSuccess: () => { invalidate(); setEditMeaning(null); toast.success('Meaning updated') },
    onError: () => toast.error('Failed to update meaning'),
  })

  const deleteMeaningMutation = useMutation({
    mutationFn: (id: number) => adminVocabularyApi.deleteMeaning(wordId, id),
    onSuccess: () => { invalidate(); toast.success('Meaning deleted') },
    onError: () => toast.error('Failed to delete meaning'),
  })

  const addExampleMutation = useMutation({
    mutationFn: () => adminVocabularyApi.addExample(wordId, newExample),
    onSuccess: () => { invalidate(); setNewExample({ sentence: '', translation: '' }); toast.success('Example added') },
    onError: () => toast.error('Failed to add example'),
  })

  const updateExampleMutation = useMutation({
    mutationFn: ({ id, sentence, translation }: { id: number; sentence: string; translation: string }) =>
      adminVocabularyApi.updateExample(wordId, id, { sentence, translation }),
    onSuccess: () => { invalidate(); setEditExample(null); toast.success('Example updated') },
    onError: () => toast.error('Failed to update example'),
  })

  const deleteExampleMutation = useMutation({
    mutationFn: (id: number) => adminVocabularyApi.deleteExample(wordId, id),
    onSuccess: () => { invalidate(); toast.success('Example deleted') },
    onError: () => toast.error('Failed to delete example'),
  })

  return (
    <>
      <Separator />

      {/* Meanings */}
      <div className="space-y-2">
        <Label className="text-base font-semibold">Meanings</Label>
        {detail.meanings.map(m => (
          <div key={m.id} className="flex gap-2 items-center">
            {editMeaning?.id === m.id ? (
              <>
                <Input
                  value={editMeaning.text}
                  onChange={e => setEditMeaning(p => p && { ...p, text: e.target.value })}
                  className="flex-1"
                  autoFocus
                />
                <Button variant="ghost" size="icon" disabled={updateMeaningMutation.isPending}
                  onClick={() => updateMeaningMutation.mutate({ id: editMeaning.id, text: editMeaning.text.trim() })}>
                  <Check className="h-4 w-4 text-green-600" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setEditMeaning(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <span className="flex-1 text-sm px-3 py-2 border rounded-md bg-muted/30">{m.text}</span>
                {canWrite && (
                  <>
                    <Button variant="ghost" size="icon" onClick={() => setEditMeaning({ id: m.id, text: m.text })}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteMeaningMutation.mutate(m.id)}
                      disabled={deleteMeaningMutation.isPending}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
        ))}
        {canWrite && (
          <div className="flex gap-2">
            <Input value={newMeaning} onChange={e => setNewMeaning(e.target.value)}
              placeholder="New meaning..." className="flex-1" />
            <Button variant="outline" onClick={() => addMeaningMutation.mutate()}
              disabled={!newMeaning.trim() || addMeaningMutation.isPending}>
              <Plus className="h-4 w-4 mr-1" />Add
            </Button>
          </div>
        )}
      </div>

      <Separator />

      {/* Examples */}
      <div className="space-y-2">
        <Label className="text-base font-semibold">Examples</Label>
        {detail.examples.map(ex => (
          <div key={ex.id} className="border rounded-md p-3 space-y-1">
            {editExample?.id === ex.id ? (
              <>
                <Input value={editExample.sentence}
                  onChange={e => setEditExample(p => p && { ...p, sentence: e.target.value })}
                  placeholder="Sentence" autoFocus />
                <Input value={editExample.translation}
                  onChange={e => setEditExample(p => p && { ...p, translation: e.target.value })}
                  placeholder="Translation" />
                <div className="flex gap-2 pt-1">
                  <Button size="sm" disabled={updateExampleMutation.isPending}
                    onClick={() => updateExampleMutation.mutate({ id: editExample.id, sentence: editExample.sentence, translation: editExample.translation })}>
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditExample(null)}>Cancel</Button>
                </div>
              </>
            ) : (
              <div className="flex gap-2 items-start">
                <div className="flex-1">
                  <p className="text-sm">{ex.sentence}</p>
                  <p className="text-sm text-muted-foreground">{ex.translation}</p>
                </div>
                {canWrite && (
                  <div className="flex shrink-0">
                    <Button variant="ghost" size="icon"
                      onClick={() => setEditExample({ id: ex.id, sentence: ex.sentence, translation: ex.translation })}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteExampleMutation.mutate(ex.id)}
                      disabled={deleteExampleMutation.isPending}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {canWrite && (
          <div className="border rounded-md p-3 space-y-2">
            <Input value={newExample.sentence}
              onChange={e => setNewExample(p => ({ ...p, sentence: e.target.value }))}
              placeholder="Sentence..." />
            <Input value={newExample.translation}
              onChange={e => setNewExample(p => ({ ...p, translation: e.target.value }))}
              placeholder="Translation..." />
            <Button variant="outline" size="sm"
              onClick={() => addExampleMutation.mutate()}
              disabled={!newExample.sentence.trim() || !newExample.translation.trim() || addExampleMutation.isPending}>
              <Plus className="h-4 w-4 mr-1" />Add Example
            </Button>
          </div>
        )}
      </div>
    </>
  )
}
