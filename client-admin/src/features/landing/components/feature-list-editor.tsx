import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {Textarea} from '@/components/ui/textarea'
import {ImageUploadField} from './image-upload-field'
import type {FeatureItem} from '../types'

interface Props {
  value: FeatureItem[]
  onChange: (items: FeatureItem[]) => void
}

export const FeatureListEditor = ({value, onChange}: Props) => {
  const update = (i: number, field: keyof FeatureItem, val: string) =>
    onChange(value.map((item, idx) => (idx === i ? {...item, [field]: val} : item)))

  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i))

  const add = () => onChange([...value, {title: '', desc: '', iconUrl: ''}])

  return (
    <div className='space-y-4'>
      <Label className='text-base font-semibold'>Why it works — Feature Cards</Label>
      {value.map((item, i) => (
        <div key={i} className='rounded-md border p-4 space-y-3'>
          <div className='flex items-center justify-between'>
            <span className='text-sm font-medium text-muted-foreground'>Card {i + 1}</span>
            <Button type='button' variant='ghost' size='sm' className='text-destructive h-7' onClick={() => remove(i)}>
              Remove
            </Button>
          </div>
          <div>
            <Label>Title</Label>
            <Input value={item.title} onChange={e => update(i, 'title', e.target.value)} />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={item.desc} onChange={e => update(i, 'desc', e.target.value)} rows={2} />
          </div>
          <ImageUploadField
            label='Icon Image'
            value={item.iconUrl}
            onChange={url => update(i, 'iconUrl', url)}
          />
        </div>
      ))}
      <Button type='button' variant='outline' size='sm' onClick={add}>
        + Add Card
      </Button>
    </div>
  )
}
