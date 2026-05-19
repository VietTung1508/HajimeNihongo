import {useEffect, useState} from 'react'
import {DndContext, closestCenter} from '@dnd-kit/core'
import type {DragEndEvent} from '@dnd-kit/core'
import {SortableContext, arrayMove, useSortable, verticalListSortingStrategy} from '@dnd-kit/sortable'
import {CSS} from '@dnd-kit/utilities'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {Textarea} from '@/components/ui/textarea'
import {GripVertical, Pencil, Plus, Trash2} from 'lucide-react'
import {toast} from 'sonner'
import {ImageUploadField} from './image-upload-field'
import {
  useCreateTestimonial,
  useDeleteTestimonial,
  useUpdateTestimonial,
  useUpdateTestimonialPositions,
} from '../hooks/use-landing-api'
import type {LandingSection, TestimonialItem} from '../types'

type FormState = {name: string; userTitle: string; content: string; avatarUrl: string}
const EMPTY: FormState = {name: '', userTitle: '', content: '', avatarUrl: ''}

const TestimonialRow = ({
  item,
  onEdit,
  onDelete,
}: {
  item: TestimonialItem
  onEdit: () => void
  onDelete: () => void
}) => {
  const {attributes, listeners, setNodeRef, transform, transition, isDragging} = useSortable({
    id: item.id,
  })
  return (
    <div
      ref={setNodeRef}
      style={{transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1}}
      className='flex items-center gap-3 rounded-lg border p-3'
    >
      <button {...attributes} {...listeners} className='cursor-grab text-muted-foreground'>
        <GripVertical className='h-4 w-4' />
      </button>
      {item.avatarUrl && (
        <img src={item.avatarUrl} alt={item.name} className='h-8 w-8 rounded-full object-cover' />
      )}
      <div className='min-w-0 flex-1'>
        <p className='truncate text-sm font-medium'>{item.name}</p>
        <p className='truncate text-xs text-muted-foreground'>{item.userTitle}</p>
      </div>
      <Button size='sm' variant='ghost' onClick={onEdit}>
        <Pencil className='h-3 w-3' />
      </Button>
      <Button size='sm' variant='ghost' onClick={onDelete} className='text-destructive'>
        <Trash2 className='h-3 w-3' />
      </Button>
    </div>
  )
}

export const TestimonialsSection = ({section}: {section: LandingSection}) => {
  const [items, setItems] = useState<TestimonialItem[]>(section.items ?? [])
  const [editingId, setEditingId] = useState<number | 'new' | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY)

  useEffect(() => {
    setItems(section.items ?? [])
  }, [section.items])

  const createMutation = useCreateTestimonial()
  const updateMutation = useUpdateTestimonial()
  const deleteMutation = useDeleteTestimonial()
  const reorderMutation = useUpdateTestimonialPositions()

  const openEdit = (item: TestimonialItem) => {
    setForm({name: item.name, userTitle: item.userTitle, content: item.content, avatarUrl: item.avatarUrl ?? ''})
    setEditingId(item.id)
  }

  const handleSave = async () => {
    try {
      if (editingId === 'new') {
        await createMutation.mutateAsync({name: form.name, userTitle: form.userTitle, content: form.content, avatarUrl: form.avatarUrl})
        toast.success('Testimonial added')
      } else if (editingId !== null) {
        await updateMutation.mutateAsync({id: editingId as number, ...form})
        toast.success('Testimonial updated')
      }
      setEditingId(null)
      setForm(EMPTY)
    } catch {
      toast.error('Failed to save testimonial')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id)
      setItems(prev => prev.filter(i => i.id !== id))
      toast.success('Testimonial deleted')
    } catch {
      toast.error('Failed to delete testimonial')
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const {active, over} = event
    if (!over || active.id === over.id) return
    const oldIdx = items.findIndex(i => i.id === active.id)
    const newIdx = items.findIndex(i => i.id === over.id)
    const reordered = arrayMove(items, oldIdx, newIdx).map((item, i) => ({...item, position: i}))
    setItems(reordered)
    reorderMutation.mutate(reordered.map(i => ({id: i.id, position: i.position})))
  }

  const isSaving = createMutation.isPending || updateMutation.isPending

  return (
    <div className='space-y-4'>
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
          <div className='flex flex-col gap-2'>
            {items.map(item => (
              <TestimonialRow
                key={item.id}
                item={item}
                onEdit={() => openEdit(item)}
                onDelete={() => handleDelete(item.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {editingId !== null && (
        <div className='space-y-3 rounded-lg border p-4'>
          <p className='text-sm font-medium'>{editingId === 'new' ? 'Add Testimonial' : 'Edit Testimonial'}</p>
          <div className='grid grid-cols-2 gap-3'>
            <div>
              <Label>Name</Label>
              <Input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
            </div>
            <div>
              <Label>Title</Label>
              <Input value={form.userTitle} onChange={e => setForm(f => ({...f, userTitle: e.target.value}))} />
            </div>
          </div>
          <div>
            <Label>Quote</Label>
            <Textarea value={form.content} onChange={e => setForm(f => ({...f, content: e.target.value}))} rows={3} />
          </div>
          <ImageUploadField
            label='Avatar'
            value={form.avatarUrl}
            onChange={url => setForm(f => ({...f, avatarUrl: url}))}
          />
          <div className='flex gap-2'>
            <Button onClick={handleSave} disabled={isSaving}>Save</Button>
            <Button variant='outline' onClick={() => setEditingId(null)}>Cancel</Button>
          </div>
        </div>
      )}

      <Button variant='outline' className='w-full' onClick={() => {setForm(EMPTY); setEditingId('new')}}>
        <Plus className='mr-2 h-4 w-4' /> Add Testimonial
      </Button>
    </div>
  )
}
