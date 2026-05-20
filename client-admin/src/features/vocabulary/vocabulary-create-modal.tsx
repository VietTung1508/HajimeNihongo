import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { adminVocabularyApi } from '@/lib/api/admin-vocabulary-api'
import { usePermission } from '@/hooks/use-permission'

interface Props {
  open: boolean
  onClose: () => void
}

const EMPTY_STATE = () => ({
  reading: '',
  kanji: '',
  jlptLevel: null as number | null,
  isCommon: false,
  meanings: [''],
  examples: [] as Array<{ sentence: string; translation: string }>,
})

export function VocabularyCreateModal({ open, onClose }: Props) {
  const { can } = usePermission()
  const qc = useQueryClient()
  const canCreate = can('vocabulary:create')

  const [form, setForm] = useState(EMPTY_STATE())

  const handleClose = () => {
    setForm(EMPTY_STATE())
    onClose()
  }

  const createMutation = useMutation({
    mutationFn: async () => {
      const word = await adminVocabularyApi.create({
        reading: form.reading.trim(),
        kanji: form.kanji.trim() || undefined,
        jlptLevel: form.jlptLevel,
        isCommon: form.isCommon,
        meanings: form.meanings.filter(m => m.trim()),
      })
      const validExamples = form.examples.filter(e => e.sentence.trim() && e.translation.trim())
      for (const ex of validExamples) {
        await adminVocabularyApi.addExample(word.id, ex)
      }
      return word
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-vocabulary'] })
      toast.success('Word created')
      handleClose()
    },
    onError: () => toast.error('Failed to create word'),
  })

  const updateMeaning = (i: number, val: string) =>
    setForm(f => ({ ...f, meanings: f.meanings.map((v, idx) => idx === i ? val : v) }))
  const addMeaning = () => setForm(f => ({ ...f, meanings: [...f.meanings, ''] }))
  const removeMeaning = (i: number) =>
    setForm(f => ({ ...f, meanings: f.meanings.filter((_, idx) => idx !== i) }))

  const updateExample = (i: number, field: 'sentence' | 'translation', val: string) =>
    setForm(f => ({ ...f, examples: f.examples.map((e, idx) => idx === i ? { ...e, [field]: val } : e) }))
  const addExample = () => setForm(f => ({ ...f, examples: [...f.examples, { sentence: '', translation: '' }] }))
  const removeExample = (i: number) =>
    setForm(f => ({ ...f, examples: f.examples.filter((_, idx) => idx !== i) }))

  const canSubmit = canCreate && form.reading.trim() && form.meanings.some(m => m.trim()) && !createMutation.isPending

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) handleClose() }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Word</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1 space-y-1">
              <Label>Reading <span className="text-destructive">*</span></Label>
              <Input
                value={form.reading}
                onChange={e => setForm(f => ({ ...f, reading: e.target.value }))}
                placeholder="e.g. はな"
              />
            </div>
            <div className="flex-1 space-y-1">
              <Label>Kanji</Label>
              <Input
                value={form.kanji}
                onChange={e => setForm(f => ({ ...f, kanji: e.target.value }))}
                placeholder="e.g. 花"
              />
            </div>
          </div>

          <div className="flex gap-4 items-end">
            <div className="space-y-1">
              <Label>JLPT Level</Label>
              <Select
                value={form.jlptLevel != null ? String(form.jlptLevel) : 'none'}
                onValueChange={v => setForm(f => ({ ...f, jlptLevel: v === 'none' ? null : Number(v) }))}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {[1, 2, 3, 4, 5].map(n => (
                    <SelectItem key={n} value={String(n)}>N{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 pb-1">
              <Checkbox
                id="create-is-common"
                checked={form.isCommon}
                onCheckedChange={v => setForm(f => ({ ...f, isCommon: v === true }))}
              />
              <Label htmlFor="create-is-common" className="cursor-pointer">Common Word</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Meanings <span className="text-destructive">*</span></Label>
            {form.meanings.map((m, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  value={m}
                  onChange={e => updateMeaning(i, e.target.value)}
                  placeholder={`Meaning ${i + 1}`}
                  className="flex-1"
                />
                {form.meanings.length > 1 && (
                  <Button variant="ghost" size="icon" onClick={() => removeMeaning(i)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addMeaning} className="w-full">
              <Plus className="h-4 w-4 mr-1" />Add Meaning
            </Button>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Examples</Label>
            {form.examples.map((ex, i) => (
              <div key={i} className="border rounded-md p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Example {i + 1}</span>
                  <Button variant="ghost" size="icon" onClick={() => removeExample(i)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <Input
                  value={ex.sentence}
                  onChange={e => updateExample(i, 'sentence', e.target.value)}
                  placeholder="Sentence (e.g. 花が咲いた)"
                />
                <Input
                  value={ex.translation}
                  onChange={e => updateExample(i, 'translation', e.target.value)}
                  placeholder="Translation (e.g. The flower bloomed)"
                />
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addExample} className="w-full">
              <Plus className="h-4 w-4 mr-1" />Add Example
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button onClick={() => createMutation.mutate()} disabled={!canSubmit}>
            {createMutation.isPending ? 'Creating...' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
