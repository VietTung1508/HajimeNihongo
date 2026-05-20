import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { adminVocabularyApi } from '@/lib/api/admin-vocabulary-api'
import { usePermission } from '@/hooks/use-permission'
import { useVocabularyDetail } from '@/hooks/use-vocabulary-detail'
import type { VocabDetail } from '@/types/vocabulary'
import { VocabularyEditSections } from './vocabulary-edit-sections'

interface Props {
  wordId: number | null
  open: boolean
  onClose: () => void
}

type WordFields = Pick<VocabDetail, 'jlptLevel' | 'isCommon'>

export function VocabularyEditModal({ wordId, open, onClose }: Props) {
  const { can } = usePermission()
  const qc = useQueryClient()
  const { data: detail, isLoading } = useVocabularyDetail(open ? wordId : null)
  const [fields, setFields] = useState<WordFields>({ jlptLevel: null, isCommon: false })

  useEffect(() => {
    if (detail) {
      setFields({ jlptLevel: detail.jlptLevel, isCommon: detail.isCommon })
    }
  }, [detail])

  const saveMutation = useMutation({
    mutationFn: () => adminVocabularyApi.update(wordId!, {
      jlptLevel: fields.jlptLevel,
      isCommon: fields.isCommon,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-vocabulary'] })
      qc.invalidateQueries({ queryKey: ['admin-vocabulary-detail', wordId] })
      toast.success('Word updated')
      onClose()
    },
    onError: () => toast.error('Failed to update word'),
  })

  const canWrite = can('vocabulary:edit')

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose() }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Word</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="py-12 text-center text-muted-foreground">Loading...</div>
        ) : detail ? (
          <div className="space-y-6">
            {/* Word Fields */}
            <div className="space-y-3">
              <div className="flex gap-4 items-end">
                <div className="space-y-1">
                  <Label>JLPT Level</Label>
                  <Select
                    value={fields.jlptLevel != null ? String(fields.jlptLevel) : 'none'}
                    onValueChange={v => setFields(f => ({ ...f, jlptLevel: v === 'none' ? null : Number(v) }))}
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
                    id="is-common"
                    checked={fields.isCommon}
                    onCheckedChange={v => setFields(f => ({ ...f, isCommon: v === true }))}
                  />
                  <Label htmlFor="is-common" className="cursor-pointer">Common Word</Label>
                </div>
              </div>
            </div>

            <VocabularyEditSections wordId={wordId!} detail={detail} canWrite={canWrite} />
          </div>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={!canWrite || saveMutation.isPending || isLoading}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
