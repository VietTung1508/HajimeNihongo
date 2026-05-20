import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Pencil, Trash2 } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { adminKanaApi } from '@/lib/api/admin-kana-api'
import type { KanaSection } from '@/types/kana'

interface RowProps {
  section: KanaSection
  onDelete: (section: KanaSection) => void
}

function SortableRow({ section, onDelete }: RowProps) {
  const navigate = useNavigate()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <tr ref={setNodeRef} style={style} className="border-b hover:bg-muted/30">
      <td className="px-4 py-3 w-10">
        <button {...attributes} {...listeners} className="cursor-grab text-muted-foreground hover:text-foreground">
          <GripVertical className="h-4 w-4" />
        </button>
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">{section.order}</td>
      <td className="px-4 py-3 font-medium">{section.title}</td>
      <td className="px-4 py-3 text-right">
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: '/kana/$id', params: { id: String(section.id) } })}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(section)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </td>
    </tr>
  )
}

interface Props {
  sections: KanaSection[]
  onDelete: (section: KanaSection) => void
}

export function KanaTable({ sections, onDelete }: Props) {
  const qc = useQueryClient()
  const sensors = useSensors(useSensor(PointerSensor))

  const reorderMutation = useMutation({
    mutationFn: adminKanaApi.reorder,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-kana'] }),
    onError: () => toast.error('Failed to save order'),
  })

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = sections.findIndex(s => s.id === active.id)
    const newIndex = sections.findIndex(s => s.id === over.id)
    const reordered = arrayMove(sections, oldIndex, newIndex)

    reorderMutation.mutate({
      sections: reordered.map((s, i) => ({ id: s.id, order: i + 1 })),
    })
  }

  if (sections.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">No sections yet.</p>
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="w-10 px-4 py-2" />
              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Order</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Title</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
            <tbody>
              {sections.map(s => (
                <SortableRow key={s.id} section={s} onDelete={onDelete} />
              ))}
            </tbody>
          </SortableContext>
        </table>
      </div>
    </DndContext>
  )
}
