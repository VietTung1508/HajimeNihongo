import { Pencil, Trash2 } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TableCell, TableRow } from '@/components/ui/table'
import { usePermission } from '@/hooks/use-permission'
import { DataTable, type TableColumn } from '@/components/core/data-table'
import type { VocabListItem } from '@/types/vocabulary'

interface Props {
  data: VocabListItem[]
  isLoading: boolean
  onEdit: (item: VocabListItem) => void
  onDelete: (item: VocabListItem) => void
}

function truncate(text: string, max = 40) {
  return text.length > max ? text.slice(0, max) + '…' : text
}

const COLUMNS: TableColumn[] = [
  { header: 'Word' },
  { header: 'Meanings' },
  { header: 'JLPT' },
  { header: 'Common' },
  { header: 'Actions', className: 'text-right' },
]

export function VocabularyTable({ data, isLoading, onEdit, onDelete }: Props) {
  const navigate = useNavigate()
  const { can } = usePermission()
  const canDelete = can('vocabulary:delete')

  return (
    <DataTable
      columns={COLUMNS}
      data={data}
      isLoading={isLoading}
      emptyMessage="No words found"
      renderRow={(item) => (
        <TableRow
          key={item.id}
          className="cursor-pointer"
          onClick={() => navigate({ to: '/vocabulary/$id', params: { id: String(item.id) } })}
        >
          <TableCell>
            {item.kanji ? (
              <div>
                <span className="font-bold">{item.kanji}</span>
                <div className="text-sm text-muted-foreground">{item.reading}</div>
              </div>
            ) : (
              <span className="font-medium">{item.reading}</span>
            )}
          </TableCell>
          <TableCell className="text-sm text-muted-foreground">
            {item.meanings.slice(0, 2).map(m => truncate(m.text)).join('; ') || '—'}
          </TableCell>
          <TableCell>
            {item.jlptLevel != null
              ? <Badge variant="outline">N{item.jlptLevel}</Badge>
              : <span className="text-muted-foreground">—</span>
            }
          </TableCell>
          <TableCell>
            {item.isCommon
              ? <Badge variant="default">Common</Badge>
              : <Badge variant="secondary" className="text-muted-foreground">Uncommon</Badge>
            }
          </TableCell>
          <TableCell className="text-right" onClick={e => e.stopPropagation()}>
            <Button variant="ghost" size="icon" onClick={() => onEdit(item)}>
              <Pencil className="h-4 w-4" />
            </Button>
            {canDelete && (
              <Button variant="ghost" size="icon" onClick={() => onDelete(item)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </TableCell>
        </TableRow>
      )}
    />
  )
}
