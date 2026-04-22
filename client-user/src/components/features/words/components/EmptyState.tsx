'use client'

import {Search} from 'lucide-react'
import {Button} from '@/components/ui/button'

interface EmptyStateProps {
  hasQuery: boolean
  onClearQuery?: () => void
}

export function EmptyState({hasQuery, onClearQuery}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Search className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No words found</h3>
      <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
        {hasQuery
          ? "Try adjusting your search or filters to find what you're looking for."
          : 'No words available at the moment.'}
      </p>
      {hasQuery && onClearQuery && (
        <Button variant="outline" onClick={onClearQuery}>
          Clear search
        </Button>
      )}
    </div>
  )
}
