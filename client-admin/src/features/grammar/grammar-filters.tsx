import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TableToolbar } from '@/components/data-table/toolbar'
import type { GrammarFilters } from '@/types/grammar'

interface Props {
  filters: GrammarFilters
  onChange: (f: GrammarFilters) => void
}

const JLPT_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1']

export function GrammarFilters({ filters, onChange }: Props) {
  const update = (patch: Partial<GrammarFilters>) =>
    onChange({ ...filters, ...patch, page: 1 })

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex-1 min-w-[200px]">
        <TableToolbar
          value={filters.q ?? ''}
          onChange={q => update({ q: q || undefined })}
          onSearch={() => update({ q: filters.q })}
          placeholder="Search grammar..."
        />
      </div>

      <Select
        value={filters.level ?? 'all'}
        onValueChange={val => update({ level: val === 'all' ? undefined : val })}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="All Levels" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Levels</SelectItem>
          {JLPT_LEVELS.map(level => (
            <SelectItem key={level} value={level}>{level}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
