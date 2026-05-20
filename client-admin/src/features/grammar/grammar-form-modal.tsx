import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { adminGrammarApi } from '@/lib/api/admin-grammar-api'
import { usePermission } from '@/hooks/use-permission'
import { useGrammarDetail } from '@/hooks/use-grammar-detail'
import { GrammarFormFields, type GrammarFormData } from './grammar-form-fields'
import { GrammarFormExamples } from './grammar-form-examples'

interface Props {
  mode: 'create' | 'edit'
  grammarId: number | null
  open: boolean
  onClose: () => void
}

type PendingExample = { sentence: string; translation: string }

const EMPTY: GrammarFormData = { grammarPoint: '', meaning: '', level: 'N5' }
const EMPTY_EX: PendingExample = { sentence: '', translation: '' }

function detailToFields(d: NonNullable<ReturnType<typeof useGrammarDetail>['data']>): GrammarFormData {
  return {
    grammarPoint: d.grammarPoint,
    meaning: d.meaning,
    level: d.level,
    lessonNumber: d.lessonNumber,
    lessonTitle: d.lessonTitle,
    structure: d.structure,
    structureDisplay: d.structureDisplay,
    partOfSpeech: d.partOfSpeech,
    register: d.register,
    about: d.about,
    exampleJp: d.exampleJp,
    exampleEn: d.exampleEn,
    synonyms: d.synonyms,
    antonyms: d.antonyms,
    meaningHint: d.meaningHint,
  }
}

export function GrammarFormModal({ mode, grammarId, open, onClose }: Props) {
  const { can } = usePermission()
  const qc = useQueryClient()
  const canWrite = can(mode === 'create' ? 'grammar:create' : 'grammar:edit')

  const { data: detail, isLoading } = useGrammarDetail(mode === 'edit' && open ? grammarId : null)
  const [fields, setFields] = useState<GrammarFormData>(EMPTY)
  const [pendingExamples, setPendingExamples] = useState<PendingExample[]>([])
  const [newEx, setNewEx] = useState<PendingExample>(EMPTY_EX)

  useEffect(() => {
    if (!open) return
    if (mode === 'create') {
      setFields(EMPTY)
      setPendingExamples([])
      setNewEx(EMPTY_EX)
      return
    }
    if (detail) setFields(detailToFields(detail))
  }, [open, mode, detail])

  const createMutation = useMutation({
    mutationFn: async () => {
      const result = await adminGrammarApi.create(fields as Parameters<typeof adminGrammarApi.create>[0])
      for (const ex of pendingExamples) {
        await adminGrammarApi.addExample(result.id, ex)
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-grammar'] })
      toast.success('Grammar point created')
      onClose()
    },
    onError: () => toast.error('Failed to create grammar point'),
  })

  const updateMutation = useMutation({
    mutationFn: () => adminGrammarApi.update(grammarId!, fields),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-grammar-detail', grammarId] })
      qc.invalidateQueries({ queryKey: ['admin-grammar'] })
      toast.success('Grammar point updated')
      onClose()
    },
    onError: () => toast.error('Failed to update grammar point'),
  })

  const handleSave = () => {
    if (!canWrite) return
    if (!fields.grammarPoint.trim() || !fields.meaning.trim() || !fields.level) {
      toast.error('Grammar point, meaning, and level are required')
      return
    }
    mode === 'create' ? createMutation.mutate() : updateMutation.mutate()
  }

  const addPendingExample = () => {
    if (!newEx.sentence.trim() || !newEx.translation.trim()) return
    setPendingExamples(p => [...p, { sentence: newEx.sentence.trim(), translation: newEx.translation.trim() }])
    setNewEx(EMPTY_EX)
  }

  const isBusy = createMutation.isPending || updateMutation.isPending
  const showLoading = mode === 'edit' && isLoading

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose() }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Add Grammar Point' : 'Edit Grammar Point'}</DialogTitle>
        </DialogHeader>

        {showLoading ? (
          <div className="py-12 text-center text-muted-foreground">Loading...</div>
        ) : (
          <div className="space-y-4">
            <GrammarFormFields
              fields={fields}
              onChange={patch => setFields(f => ({ ...f, ...patch }))}
              disabled={!canWrite || isBusy}
            />

            {/* Create mode: local pending examples */}
            {mode === 'create' && (
              <>
                <Separator />
                <div className="space-y-2">
                  <Label className="text-base font-semibold">Examples</Label>
                  {pendingExamples.map((ex, idx) => (
                    <div key={idx} className="border rounded-md p-3">
                      <div className="flex gap-2 items-start">
                        <div className="flex-1">
                          <p className="text-sm">{ex.sentence}</p>
                          <p className="text-sm text-muted-foreground">{ex.translation}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={isBusy}
                          onClick={() => setPendingExamples(p => p.filter((_, i) => i !== idx))}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="border rounded-md p-3 space-y-2">
                    <Input
                      value={newEx.sentence}
                      onChange={e => setNewEx(p => ({ ...p, sentence: e.target.value }))}
                      placeholder="Japanese sentence..."
                      disabled={isBusy}
                    />
                    <Input
                      value={newEx.translation}
                      onChange={e => setNewEx(p => ({ ...p, translation: e.target.value }))}
                      placeholder="English translation..."
                      disabled={isBusy}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!newEx.sentence.trim() || !newEx.translation.trim() || isBusy}
                      onClick={addPendingExample}
                    >
                      <Plus className="h-4 w-4 mr-1" />Add Example
                    </Button>
                  </div>
                </div>
              </>
            )}

            {/* Edit mode: live examples via API */}
            {mode === 'edit' && grammarId !== null && detail && (
              <GrammarFormExamples
                grammarId={grammarId}
                examples={detail.examples}
                canWrite={canWrite}
              />
            )}
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isBusy}>Cancel</Button>
          <Button onClick={handleSave} disabled={!canWrite || isBusy || showLoading}>
            {isBusy ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
