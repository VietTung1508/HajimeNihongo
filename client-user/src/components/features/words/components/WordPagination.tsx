'use client'

import {ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight} from 'lucide-react'
import {Button} from '@/components/ui/button'

interface WordPaginationProps {
  page: number
  total: number
  limit: number
  onPageChange: (page: number) => void
}

export function WordPagination({page, total, limit, onPageChange}: WordPaginationProps) {
  const totalPages = Math.ceil(total / limit)
  if (totalPages <= 1) return null

  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = []
    const maxVisible = 5 
 
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)

      let start = Math.max(2, page - 1)
      let end = Math.min(totalPages - 1, page + 1)

      if (page <= 2) {
        start = 2
        end = Math.min(4, totalPages - 1)
      } else if (page >= totalPages - 1) {
        start = Math.max(totalPages - 3, 2)
        end = totalPages - 1
      }

      if (start > 2) {
        pages.push('...')
      }

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (end < totalPages - 1) {
        pages.push('...')
      }

      if (totalPages > 1) {
        pages.push(totalPages)
      }
    }

    return pages
  }

  const pages = getPageNumbers()

  return (
    <div className="flex items-center justify-end gap-2 py-6">
      {/* First page button */}
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(1)}
      >
        <ChevronsLeft className="h-4 w-4" />
      </Button>

      {/* Previous button */}
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {pages.map((p, idx) =>
        typeof p === 'number' ? (
          <Button
            key={idx}
            variant={p === page ? 'default' : 'outline'}
            size="sm"
            onClick={() => onPageChange(p)}
          >
            {p}
          </Button>
        ) : (
          <span key={idx} className="px-2 text-muted-foreground">
            {p}
          </span>
        )
      )}

      {/* Next button */}
      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Last page button */}
      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(totalPages)}
      >
        <ChevronsRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
