import { useState } from 'react'
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { adminGrammarApi } from '@/lib/api/admin-grammar-api'
import type { GrammarExample } from '@/types/grammar'

interface Props {
  grammarId: number
  examples: GrammarExample[]
  canWrite: boolean
}

export function GrammarFormExamples({ grammarId, examples, canWrite }: Props) {
  const qc = useQueryClient()
  const [newEx, setNewEx] = useState({ sentence: '', translation: '' })
  const [editEx, setEditEx] = useState<{ id: number; sentence: string; translation: string } | null>(null)

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin-grammar-detail', grammarId] })

  const addMutation = useMutation({
    mutationFn: () => adminGrammarApi.addExample(grammarId, newEx),
    onSuccess: () => {
      invalidate()
      setNewEx({ sentence: '', translation: '' })
      toast.success('Example added')
    },
    onError: () => toast.error('Failed to add example'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, sentence, translation }: { id: number; sentence: string; translation: string }) =>
      adminGrammarApi.updateExample(grammarId, id, { sentence, translation }),
    onSuccess: () => {
      invalidate()
      setEditEx(null)
      toast.success('Example updated')
    },
    onError: () => toast.error('Failed to update example'),
  })

  const deleteMutation = useMutation({
    mutationFn: (exampleId: number) => adminGrammarApi.deleteExample(grammarId, exampleId),
    onSuccess: () => { invalidate(); toast.success('Example deleted') },
    onError: () => toast.error('Failed to delete example'),
  })

  return (
    <>
      <Separator />
      <div className="space-y-2">
        <Label className="text-base font-semibold">Examples</Label>

        {examples.map(ex => (
          <div key={ex.id} className="border rounded-md p-3 space-y-1">
            {editEx?.id === ex.id ? (
              <>
                <Input
                  value={editEx.sentence}
                  onChange={e => setEditEx(p => p && { ...p, sentence: e.target.value })}
                  placeholder="Japanese sentence"
                  autoFocus
                />
                <Input
                  value={editEx.translation}
                  onChange={e => setEditEx(p => p && { ...p, translation: e.target.value })}
                  placeholder="English translation"
                />
                <div className="flex gap-2 pt-1">
                  <Button
                    size="sm"
                    disabled={updateMutation.isPending}
                    onClick={() => updateMutation.mutate({ id: editEx.id, sentence: editEx.sentence, translation: editEx.translation })}
                  >
                    <Check className="h-4 w-4 mr-1" />Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditEx(null)}>
                    <X className="h-4 w-4 mr-1" />Cancel
                  </Button>
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
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditEx({ id: ex.id, sentence: ex.sentence, translation: ex.translation })}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(ex.id)}
                      disabled={deleteMutation.isPending}
                    >
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
            <Input
              value={newEx.sentence}
              onChange={e => setNewEx(p => ({ ...p, sentence: e.target.value }))}
              placeholder="Japanese sentence..."
            />
            <Input
              value={newEx.translation}
              onChange={e => setNewEx(p => ({ ...p, translation: e.target.value }))}
              placeholder="English translation..."
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => addMutation.mutate()}
              disabled={!newEx.sentence.trim() || !newEx.translation.trim() || addMutation.isPending}
            >
              <Plus className="h-4 w-4 mr-1" />Add Example
            </Button>
          </div>
        )}
      </div>
    </>
  )
}
