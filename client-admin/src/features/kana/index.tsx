import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TableToolbar } from '@/components/data-table/toolbar'
import { TablePagination } from '@/components/data-table/pagination'

const Kana = () => {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kana</h1>
          <p className="text-sm text-muted-foreground">Manage hiragana and katakana learning sections</p>
        </div>
        <Button size="sm">
          <Plus /> Add Section
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kana Sections</CardTitle>
          <CardDescription>Learning sections for hiragana and katakana characters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <TableToolbar
            value={search}
            onChange={v => { setSearch(v); setPage(1) }}
            placeholder="Search kana..."
          />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Character</TableHead>
                <TableHead>Romaji</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Section</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  No kana sections found
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <TablePagination total={0} page={page} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={setPageSize} />
        </CardContent>
      </Card>
    </div>
  )
}

export default Kana
