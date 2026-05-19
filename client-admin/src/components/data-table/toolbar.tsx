import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface TableToolbarProps {
  value: string
  onChange: (value: string) => void
  onSearch?: () => void
  placeholder?: string
}

export function TableToolbar({ value, onChange, onSearch, placeholder = 'Search...' }: TableToolbarProps) {
  return (
    <div className="flex items-center gap-2">
      <Input
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && onSearch?.()}
        placeholder={placeholder}
        className="h-9 w-64"
      />
      <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" onClick={onSearch}>
        <Search className="h-4 w-4" />
      </Button>
    </div>
  )
}
