import {useRef} from 'react'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {useUploadImage} from '../hooks/use-landing-api'
import {toast} from 'sonner'

interface Props {
  label: string
  value: string
  onChange: (url: string) => void
}

export const ImageUploadField = ({label, value, onChange}: Props) => {
  const fileRef = useRef<HTMLInputElement>(null)
  const upload = useUploadImage()

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const url = await upload.mutateAsync(file)
      onChange(url)
      toast.success('Image uploaded')
    } catch {
      toast.error('Upload failed')
    }
  }

  return (
    <div className='space-y-2'>
      <Label>{label}</Label>
      <div className='flex gap-2'>
        <Input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder='Paste URL or upload'
        />
        <Button
          type='button'
          variant='outline'
          onClick={() => fileRef.current?.click()}
          disabled={upload.isPending}
        >
          {upload.isPending ? 'Uploading...' : 'Upload'}
        </Button>
      </div>
      <input
        ref={fileRef}
        type='file'
        accept='image/jpeg,image/png,image/webp,image/gif'
        className='hidden'
        onChange={handleFile}
      />
      {value && (
        value.startsWith('http')
          ? <img src={value} alt='preview' className='h-20 w-auto rounded-md object-cover' />
          : <p className='text-xs text-muted-foreground italic'>Local asset — preview available in user app</p>
      )}
    </div>
  )
}
