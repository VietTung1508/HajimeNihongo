import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { RichTextEditor } from '@/components/core/rich-text-editor'
import { adminKanaApi } from '@/lib/api/admin-kana-api'
import type { CreateKanaPayload, KanaSectionType } from '@/types/kana'

async function handleImageUpload(file: File): Promise<string> {
  return adminKanaApi.uploadImage(file)
}

interface Props {
  open: boolean
  onClose: () => void
}

const EMPTY: CreateKanaPayload = { type: 'hiragana', title: '', content: '', order: 1 }

export function KanaCreateModal({ open, onClose }: Props) {
  const [fields, setFields] = useState<CreateKanaPayload>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<keyof CreateKanaPayload, string>>>({})
  const qc = useQueryClient()

  const set = (patch: Partial<CreateKanaPayload>) => setFields(f => ({ ...f, ...patch }))

  function validate(): boolean {
    const errs: typeof errors = {}
    if (!fields.title.trim()) errs.title = 'Title is required'
    if (!fields.content.trim() || fields.content === '<p></p>') errs.content = 'Content is required'
    if (!fields.order || fields.order < 1) errs.order = 'Order must be ≥ 1'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const createMutation = useMutation({
    mutationFn: adminKanaApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-kana'] })
      toast.success('Section created')
      setFields(EMPTY)
      onClose()
    },
    onError: () => toast.error('Failed to create section'),
  })

  function handleSubmit() {
    if (!validate()) return
    createMutation.mutate(fields)
  }

  function handleClose() {
    setFields(EMPTY)
    setErrors({})
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Kana Section</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Type *</Label>
              <Select value={fields.type} onValueChange={v => set({ type: v as KanaSectionType })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hiragana">Hiragana</SelectItem>
                  <SelectItem value="katakana">Katakana</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Order *</Label>
              <Input
                type="number"
                min={1}
                value={fields.order}
                onChange={e => set({ order: Number(e.target.value) })}
              />
              {errors.order && <p className="text-xs text-destructive">{errors.order}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <Label>Title *</Label>
            <Input
              value={fields.title}
              onChange={e => set({ title: e.target.value })}
              placeholder="e.g. あ行 (a-row)"
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
          </div>

          <div className="space-y-1">
            <Label>Content *</Label>
            <RichTextEditor
              value={fields.content}
              onChange={content => set({ content })}
              onImageUpload={handleImageUpload}
            />
            {errors.content && <p className="text-xs text-destructive">{errors.content}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={createMutation.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Creating...' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
