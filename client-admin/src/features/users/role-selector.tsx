import * as React from 'react'
import { Check, ChevronsUpDown, X } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { rolesApi } from '@/lib/api/roles-api'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface Props {
  selectedIds: string[]
  onChange: (ids: string[]) => void
}

export function RoleSelector({ selectedIds, onChange }: Props) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const containerRef = React.useRef<HTMLDivElement>(null)

  const { data: roles = [] } = useQuery({
    queryKey: ['roles-list'],
    queryFn: rolesApi.list,
  })

  const filtered = roles
    .filter((r) => r.name !== 'Super Admin')
    .filter((r) => r.name.toLowerCase().includes(search.toLowerCase()))

  const toggle = (id: string) => {
    onChange(selectedIds.includes(id) ? [] : [id])
  }

  const removeRole = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    onChange(selectedIds.filter((s) => s !== id))
  }

  // Close on outside click
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const selectedRoles = roles.filter((r) => selectedIds.includes(r.id))

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex min-h-9 w-full flex-wrap items-center gap-1 rounded-md border border-input bg-transparent px-3 py-1.5 text-sm shadow-sm transition-colors',
          'focus:outline-none focus:ring-1 focus:ring-ring',
          open && 'ring-1 ring-ring'
        )}
      >
        {selectedRoles.length === 0 ? (
          <span className="text-muted-foreground">Select role…</span>
        ) : (
          selectedRoles.map((r) => (
            <Badge key={r.id} variant="secondary" className="flex items-center gap-1 pr-1">
              {r.name}
              <X
                className="h-3 w-3 cursor-pointer opacity-70 hover:opacity-100"
                onClick={(e) => removeRole(e, r.id)}
              />
            </Badge>
          ))
        )}
        <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md">
          <div className="border-b p-2">
            <input
              autoFocus
              placeholder="Search roles…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <ul className="max-h-48 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <li className="px-2 py-4 text-center text-sm text-muted-foreground">
                No roles found.
              </li>
            ) : (
              filtered.map((r) => {
                const selected = selectedIds.includes(r.id)
                return (
                  <li
                    key={r.id}
                    onClick={() => toggle(r.id)}
                    className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                  >
                    <Check
                      className={cn('h-4 w-4', selected ? 'opacity-100' : 'opacity-0')}
                    />
                    {r.name}
                  </li>
                )
              })
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
