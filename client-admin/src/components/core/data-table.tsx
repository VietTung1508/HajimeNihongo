import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { ReactNode } from 'react'

export interface TableColumn {
  header: ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: TableColumn[]
  data: T[]
  isLoading: boolean
  emptyMessage?: string
  renderRow: (item: T) => ReactNode
}

export function DataTable<T>({ columns, data, isLoading, emptyMessage = 'No data found', renderRow }: DataTableProps<T>) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((col, i) => (
            <TableHead key={i} className={col.className}>{col.header}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">
              Loading...
            </TableCell>
          </TableRow>
        ) : data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">
              {emptyMessage}
            </TableCell>
          </TableRow>
        ) : data.map(renderRow)}
      </TableBody>
    </Table>
  )
}
