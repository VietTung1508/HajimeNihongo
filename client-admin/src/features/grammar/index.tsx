import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TablePagination } from '@/components/data-table/pagination'
import { usePermission } from '@/hooks/use-permission'
import { useGrammar } from '@/hooks/use-grammar'
import type { GrammarFilters, GrammarListItem } from '@/types/grammar'
import { GrammarFilters as GrammarFiltersBar } from './grammar-filters'
import { GrammarTable } from './grammar-table'
import { GrammarFormModal } from './grammar-form-modal'

interface ModalState {
  mode: 'create' | 'edit'
  grammarId: number | null
  open: boolean
}

const CLOSED: ModalState = { mode: 'create', grammarId: null, open: false }

export default function Grammar({ autoOpen = false }: { autoOpen?: boolean }) {
  const { can } = usePermission()
  const canCreate = can('grammar:create')

  const [filters, setFilters] = useState<GrammarFilters>({ page: 1, limit: 10 })
  const [modal, setModal] = useState<ModalState>(CLOSED)

  useEffect(() => {
    if (autoOpen && canCreate) setModal({ mode: 'create', grammarId: null, open: true })
  }, [autoOpen, canCreate])

  const { data, isLoading } = useGrammar(filters)

  const openCreate = () => setModal({ mode: 'create', grammarId: null, open: true })
  const openEdit = (item: GrammarListItem) => setModal({ mode: 'edit', grammarId: item.id, open: true })
  const closeModal = () => setModal(CLOSED)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Grammar</h1>
          <p className="text-sm text-muted-foreground">Manage grammar points and example sentences</p>
        </div>
        {canCreate && (
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1" /> Add Grammar
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Grammar Points</CardTitle>
          <CardDescription>Grammar rules organized by JLPT level</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <GrammarFiltersBar filters={filters} onChange={setFilters} />
          <GrammarTable
            data={data?.data ?? []}
            isLoading={isLoading}
            onEdit={openEdit}
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

      <GrammarFormModal
        mode={modal.mode}
        grammarId={modal.grammarId}
        open={modal.open}
        onClose={closeModal}
      />
    </div>
  )
}
