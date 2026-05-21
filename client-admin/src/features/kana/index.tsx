import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConfirmDialog } from '@/components/core/confirm-dialog'
import { useKana } from '@/hooks/use-kana'
import { adminKanaApi } from '@/lib/api/admin-kana-api'
import type { KanaSection } from '@/types/kana'
import { KanaTable } from './kana-table'
import { KanaCreateModal } from './kana-create-modal'

export default function KanaPage({ autoOpen = false }: { autoOpen?: boolean }) {
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<KanaSection | null>(null)

  useEffect(() => {
    if (autoOpen) setCreateOpen(true)
  }, [autoOpen])

  const qc = useQueryClient()
  const { data, isLoading, isError } = useKana()

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminKanaApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-kana'] })
      toast.success('Section deleted')
      setDeleteTarget(null)
    },
    onError: () => toast.error('Failed to delete section'),
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kana Sections</h1>
          <p className="text-sm text-muted-foreground">Manage hiragana and katakana learning content</p>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Section
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Sections</CardTitle>
          <CardDescription>Drag rows to reorder. Click edit to update content.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <p className="text-sm text-muted-foreground text-center py-8">Loading...</p>
          )}
          {isError && (
            <p className="text-sm text-destructive text-center py-8">Failed to load kana sections.</p>
          )}
          {data && (
            <Tabs defaultValue="hiragana">
              <TabsList className="mb-4">
                <TabsTrigger value="hiragana">
                  Hiragana ({data.hiragana.length})
                </TabsTrigger>
                <TabsTrigger value="katakana">
                  Katakana ({data.katakana.length})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="hiragana">
                <KanaTable sections={data.hiragana} onDelete={setDeleteTarget} />
              </TabsContent>
              <TabsContent value="katakana">
                <KanaTable sections={data.katakana} onDelete={setDeleteTarget} />
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      <KanaCreateModal open={createOpen} onClose={() => setCreateOpen(false)} />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete Section"
        description={`Delete "${deleteTarget?.title}"? This action cannot be undone.`}
        submitText={deleteMutation.isPending ? 'Deleting...' : 'Delete'}
        cancelText="Cancel"
        onSubmit={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
