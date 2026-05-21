import { useNavigate } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TableCell, TableRow } from '@/components/ui/table'
import { DataTable, type TableColumn } from '@/components/core/data-table'
import type { TopBookmarkedVocab, TopBookmarkedGrammar } from '@/lib/api/admin-dashboard-api'

const VOCAB_COLUMNS: TableColumn[] = [
  { header: 'Word' },
  { header: 'Reading' },
  { header: 'Saves', className: 'text-right w-16' },
]

const GRAMMAR_COLUMNS: TableColumn[] = [
  { header: 'Pattern' },
  { header: 'Level', className: 'w-14' },
  { header: 'Saves', className: 'text-right w-16' },
]

interface TopBookmarksVocabCardProps {
  data: TopBookmarkedVocab[]
  isLoading: boolean
  isError: boolean
}

export function TopBookmarksVocabCard({ data, isLoading, isError }: TopBookmarksVocabCardProps) {
  const navigate = useNavigate()

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Top Bookmarked Vocabulary</CardTitle>
        <CardDescription className="text-xs">Most saved words by users</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {isError ? (
          <p className="p-4 text-sm text-destructive">Failed to load data.</p>
        ) : (
          <DataTable
            columns={VOCAB_COLUMNS}
            data={data}
            isLoading={isLoading}
            emptyMessage="No bookmarked vocabulary yet"
            renderRow={(item: TopBookmarkedVocab) => (
              <TableRow
                key={item.id}
                className="cursor-pointer hover:bg-muted/50 text-sm"
                onClick={() => navigate({ to: '/vocabulary/$id', params: { id: String(item.id) } })}
              >
                <TableCell className="font-medium">{item.kanji ?? item.reading}</TableCell>
                <TableCell className="text-muted-foreground">{item.kanji ? item.reading : '—'}</TableCell>
                <TableCell className="text-right text-blue-600 font-semibold">{item.count}</TableCell>
              </TableRow>
            )}
          />
        )}
      </CardContent>
    </Card>
  )
}

interface TopBookmarksGrammarCardProps {
  data: TopBookmarkedGrammar[]
  isLoading: boolean
  isError: boolean
}

export function TopBookmarksGrammarCard({ data, isLoading, isError }: TopBookmarksGrammarCardProps) {
  const navigate = useNavigate()

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Top Bookmarked Grammar</CardTitle>
        <CardDescription className="text-xs">Most saved grammar points by users</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {isError ? (
          <p className="p-4 text-sm text-destructive">Failed to load data.</p>
        ) : (
          <DataTable
            columns={GRAMMAR_COLUMNS}
            data={data}
            isLoading={isLoading}
            emptyMessage="No bookmarked grammar yet"
            renderRow={(item: TopBookmarkedGrammar) => (
              <TableRow
                key={item.id}
                className="cursor-pointer hover:bg-muted/50 text-sm"
                onClick={() => navigate({ to: '/grammar/$id', params: { id: String(item.id) } })}
              >
                <TableCell className="font-medium">{item.grammarPoint}</TableCell>
                <TableCell className="text-muted-foreground">{item.level}</TableCell>
                <TableCell className="text-right text-amber-600 font-semibold">{item.count}</TableCell>
              </TableRow>
            )}
          />
        )}
      </CardContent>
    </Card>
  )
}
