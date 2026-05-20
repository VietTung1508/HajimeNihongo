import { useState, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowLeft, Save } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { RichTextEditor } from '@/components/core/rich-text-editor'
import { useKanaDetail } from '@/hooks/use-kana-detail'
import { adminKanaApi } from '@/lib/api/admin-kana-api'
import type { KanaSectionType, UpdateKanaPayload } from '@/types/kana'

async function handleImageUpload(file: File): Promise<string> {
  return adminKanaApi.uploadImage(file)
}

interface Props {
  id: number
}

export default function KanaDetail({ id }: Props) {
  const qc = useQueryClient()
  const { data: section, isLoading, isError } = useKanaDetail(id)

  const [fields, setFields] = useState<UpdateKanaPayload>({})
  const set = (patch: UpdateKanaPayload) => setFields(f => ({ ...f, ...patch }))

  useEffect(() => {
    if (section) {
      setFields({
        type: section.type,
        title: section.title,
        content: section.content,
        order: section.order,
      })
    }
  }, [section])

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateKanaPayload) => adminKanaApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-kana', id] })
      qc.invalidateQueries({ queryKey: ['admin-kana'] })
      toast.success('Section saved')
    },
    onError: () => toast.error('Failed to save section'),
  })

  if (isLoading) {
    return <div className="py-12 text-center text-muted-foreground">Loading...</div>
  }
  if (isError || !section) {
    return <div className="py-12 text-center text-muted-foreground">Section not found</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/kana">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{section.title}</h1>
          <p className="text-sm text-muted-foreground capitalize">{section.type}</p>
        </div>
        <Button onClick={() => updateMutation.mutate(fields)} disabled={updateMutation.isPending}>
          <Save className="h-4 w-4 mr-2" />
          {updateMutation.isPending ? 'Saving...' : 'Save'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Section Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label>Type</Label>
              <Select
                value={fields.type}
                onValueChange={v => set({ type: v as KanaSectionType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hiragana">Hiragana</SelectItem>
                  <SelectItem value="katakana">Katakana</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1 col-span-2">
              <Label>Title</Label>
              <Input
                value={fields.title ?? ''}
                onChange={e => set({ title: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <Label>Order</Label>
              <Input
                type="number"
                min={1}
                value={fields.order ?? ''}
                onChange={e => set({ order: Number(e.target.value) })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Content</CardTitle>
        </CardHeader>
        <CardContent>
          <RichTextEditor
            value={fields.content ?? ''}
            onChange={content => set({ content })}
            className="min-h-[400px]"
            onImageUpload={handleImageUpload}
          />
        </CardContent>
      </Card>
    </div>
  )
}
