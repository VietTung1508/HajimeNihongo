import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const Grammar = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Grammar</h1>
        <p className="text-sm text-muted-foreground">Manage grammar points and example sentences</p>
      </div>
      <Button size="sm">
        <Plus /> Add Grammar
      </Button>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>All Grammar Points</CardTitle>
        <CardDescription>Grammar rules organized by JLPT level</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Pattern</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Examples</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                No grammar points found
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
)

export default Grammar
