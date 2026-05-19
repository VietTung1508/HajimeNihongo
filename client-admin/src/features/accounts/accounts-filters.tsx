import { TableToolbar } from '@/components/data-table/toolbar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import type { AccountFilters } from '@/types/account'

const LEVEL_OPTIONS = ['ZERO', 'N5', 'N4', 'N3', 'N2', 'N1']
const PACE_OPTIONS = ['RELAX', 'DETERMINED', 'RIGOROUS']
const LEVEL_LABELS: Record<string, string> = {
  ZERO: 'Beginner', N5: 'N5', N4: 'N4', N3: 'N3', N2: 'N2', N1: 'N1',
}
const PACE_LABELS: Record<string, string> = {
  RELAX: 'Relax', DETERMINED: 'Determined', RIGOROUS: 'Rigorous',
}

interface AccountsFiltersProps {
  filters: AccountFilters
  onChange: (filters: AccountFilters) => void
}

export function AccountsFilters({ filters, onChange }: AccountsFiltersProps) {
  const hasFilters = !!filters.search || !!filters.level || !!filters.studyPace

  return (
    <div className="flex justify-between flex-wrap items-center gap-2">
      <TableToolbar
        placeholder="Search by name or email..."
        value={filters.search ?? ''}
        onChange={val => onChange({ ...filters, search: val, page: 1 })}
      />

      <div className='flex items-center gap-2'>
        <Select
        value={filters.level ?? 'all'}
        onValueChange={val => onChange({ ...filters, level: val === 'all' ? undefined : val, page: 1 })}
      >
        <SelectTrigger className="w-36">
          <SelectValue placeholder="All levels" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All levels</SelectItem>
          {LEVEL_OPTIONS.map(l => (
            <SelectItem key={l} value={l}>{LEVEL_LABELS[l]}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.studyPace ?? 'all'}
        onValueChange={val => onChange({ ...filters, studyPace: val === 'all' ? undefined : val, page: 1 })}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="All paces" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All paces</SelectItem>
          {PACE_OPTIONS.map(p => (
            <SelectItem key={p} value={p}>{PACE_LABELS[p]}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={() => onChange({ page: 1, limit: 20 })}>
          Clear filters
        </Button>
      )}
      </div>
    </div>
  )
}
