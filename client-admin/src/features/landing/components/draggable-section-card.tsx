import {useSortable} from '@dnd-kit/sortable'
import {CSS} from '@dnd-kit/utilities'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {ChevronDown, ChevronUp, GripVertical} from 'lucide-react'

interface Props {
  id: string
  title: string
  open: boolean
  onToggle: () => void
  children: React.ReactNode
}

export const DraggableSectionCard = ({id, title, open, onToggle, children}: Props) => {
  const {attributes, listeners, setNodeRef, transform, transition, isDragging} = useSortable({id})

  return (
    <Card
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      <CardHeader className='flex flex-row items-center gap-3 py-3'>
        <button
          {...attributes}
          {...listeners}
          className='cursor-grab touch-none text-muted-foreground hover:text-foreground'
          aria-label='Drag to reorder'
        >
          <GripVertical className='h-5 w-5' />
        </button>
        <CardTitle className='flex-1 text-base'>{title}</CardTitle>
        <button
          onClick={onToggle}
          className='text-muted-foreground hover:text-foreground'
        >
          {open ? <ChevronUp className='h-4 w-4' /> : <ChevronDown className='h-4 w-4' />}
        </button>
      </CardHeader>
      {open && <CardContent>{children}</CardContent>}
    </Card>
  )
}
