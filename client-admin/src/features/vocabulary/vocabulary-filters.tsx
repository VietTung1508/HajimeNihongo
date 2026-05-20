import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TableToolbar } from '@/components/data-table/toolbar'
import type { VocabFilters } from '@/types/vocabulary'

interface Props {
  filters: VocabFilters
  onChange: (f: VocabFilters) => void
}

const JLPT_LEVELS = [1, 2, 3, 4, 5]

export function VocabularyFilters({ filters, onChange }: Props) {
  const update = (patch: Partial<VocabFilters>) =>
    onChange({ ...filters, ...patch, page: 1 })

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex-1 min-w-[200px]">
        <TableToolbar
          value={filters.q ?? ''}
          onChange={q => update({ q: q || undefined })}
          placeholder="Search vocabulary..."
        />
      </div>

      <Select
        value={filters.level != null ? String(filters.level) : 'all'}
        onValueChange={val => update({ level: val === 'all' ? undefined : Number(val) })}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="All Levels" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Levels</SelectItem>
          {JLPT_LEVELS.map(n => (
            <SelectItem key={n} value={String(n)}>N{n}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex items-center gap-2">
        <Checkbox
          id="common-only"
          checked={filters.commonOnly ?? false}
          onCheckedChange={checked => update({ commonOnly: checked === true ? true : undefined })}
        />
        <Label htmlFor="common-only" className="cursor-pointer">Common Only</Label>
      </div>
    </div>
  )
}
