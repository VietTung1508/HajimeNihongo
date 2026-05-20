import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TableCell, TableRow } from '@/components/ui/table'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { adminGrammarApi } from '@/lib/api/admin-grammar-api'
import { usePermission } from '@/hooks/use-permission'
import { ConfirmDialog } from '@/components/core/confirm-dialog'
import { DataTable, type TableColumn } from '@/components/core/data-table'
import type { GrammarListItem } from '@/types/grammar'

interface Props {
  data: GrammarListItem[]
  isLoading: boolean
  onEdit: (item: GrammarListItem) => void
}

function truncate(text: string, max = 60) {
  return text.length > max ? text.slice(0, max) + '...' : text
}

const COLUMNS: TableColumn[] = [
  { header: 'Grammar Point' },
  { header: 'Meaning' },
  { header: 'Level' },
  { header: 'Lesson #' },
  { header: 'Examples' },
  { header: 'Actions', className: 'text-right' },
]

export function GrammarTable({ data, isLoading, onEdit }: Props) {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { can } = usePermission()
  const canDelete = can('grammar:delete')

  const [confirmItem, setConfirmItem] = useState<GrammarListItem | null>(null)

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminGrammarApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-grammar'] })
      toast.success('Grammar point deleted')
    },
    onError: () => toast.error('Failed to delete grammar point'),
  })

  return (
    <>
      <DataTable
        columns={COLUMNS}
        data={data}
        isLoading={isLoading}
        emptyMessage="No grammar points found"
        renderRow={(item) => (
          <TableRow
            key={item.id}
            className="cursor-pointer"
            onClick={() => navigate({ to: '/grammar/$id', params: { id: String(item.id) } })}
          >
            <TableCell className="font-bold">{item.grammarPoint}</TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {truncate(item.meaning)}
            </TableCell>
            <TableCell>
              <Badge variant="outline">{item.level}</Badge>
            </TableCell>
            <TableCell>
              {item.lessonNumber != null ? item.lessonNumber : <span className="text-muted-foreground">—</span>}
            </TableCell>
            <TableCell>
              <Badge variant="secondary">{item.examplesCount}</Badge>
            </TableCell>
            <TableCell className="text-right" onClick={e => e.stopPropagation()}>
              <div className="flex justify-end gap-1">
                <Button variant="ghost" size="icon" onClick={() => onEdit(item)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                {canDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setConfirmItem(item)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        )}
      />

      <ConfirmDialog
        open={confirmItem !== null}
        title="Delete Grammar Point"
        description={`Delete "${confirmItem?.grammarPoint}"? This cannot be undone.`}
        submitText="Delete"
        onSubmit={() => {
          if (confirmItem) deleteMutation.mutate(confirmItem.id)
          setConfirmItem(null)
        }}
        onCancel={() => setConfirmItem(null)}
      />
    </>
  )
}
