import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TablePagination } from '@/components/data-table/pagination'
import { ConfirmDialog } from '@/components/core/confirm-dialog'
import { usePermission } from '@/hooks/use-permission'
import { useVocabulary } from '@/hooks/use-vocabulary'
import { adminVocabularyApi } from '@/lib/api/admin-vocabulary-api'
import type { VocabFilters, VocabListItem } from '@/types/vocabulary'
import { VocabularyFilters } from './vocabulary-filters'
import { VocabularyTable } from './vocabulary-table'
import { VocabularyEditModal } from './vocabulary-edit-modal'
import { VocabularyCreateModal } from './vocabulary-create-modal'

export default function Vocabulary({ autoOpen = false }: { autoOpen?: boolean }) {
  const [filters, setFilters] = useState<VocabFilters>({ page: 1, limit: 10 })
  const [editWordId, setEditWordId] = useState<number | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<VocabListItem | null>(null)

  const { can } = usePermission()
  const canVocabCreate = can('vocabulary:create')
  useEffect(() => {
    if (autoOpen && canVocabCreate) setCreateOpen(true)
  }, [autoOpen, canVocabCreate])

  const qc = useQueryClient()
  const { data, isLoading } = useVocabulary(filters)

  const handleEdit = (item: VocabListItem) => {
    setEditWordId(item.id)
    setEditOpen(true)
  }

  const handleCloseModal = () => {
    setEditOpen(false)
    setEditWordId(null)
  }

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminVocabularyApi.deleteWord(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-vocabulary'] })
      toast.success('Word deleted')
      setDeleteTarget(null)
    },
    onError: () => toast.error('Failed to delete word'),
  })

  const handleDelete = (item: VocabListItem) => setDeleteTarget(item)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vocabulary</h1>
          <p className="text-sm text-muted-foreground">Manage the Japanese word database</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />Add Word
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Words</CardTitle>
          <CardDescription>Japanese vocabulary entries with JLPT levels</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <VocabularyFilters filters={filters} onChange={setFilters} />
          <VocabularyTable
            data={data?.data ?? []}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
          <TablePagination
            total={data?.total ?? 0}
            page={filters.page ?? 1}
            pageSize={filters.limit ?? 10}
            onPageChange={page => setFilters(f => ({ ...f, page }))}
            onPageSizeChange={limit => setFilters(f => ({ ...f, limit, page: 1 }))}
          />
        </CardContent>
      </Card>

      <VocabularyEditModal
        wordId={editWordId}
        open={editOpen}
        onClose={handleCloseModal}
      />

      <VocabularyCreateModal open={createOpen} onClose={() => setCreateOpen(false)} />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete Word"
        description={`Delete "${deleteTarget?.kanji ?? deleteTarget?.reading}"? This action cannot be undone.`}
        submitText={deleteMutation.isPending ? 'Deleting...' : 'Delete'}
        cancelText="Cancel"
        onSubmit={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
