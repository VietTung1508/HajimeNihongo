import {useForm} from 'react-hook-form'
import {yupResolver} from '@hookform/resolvers/yup'
import * as yup from 'yup'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {Textarea} from '@/components/ui/textarea'
import {toast} from 'sonner'
import {useUpdateSectionConfig} from '../hooks/use-landing-api'
import {ImageUploadField} from './image-upload-field'
import type {CtaContent, LandingSection} from '../types'

const schema = yup.object({
  headline: yup.string().required(),
  description: yup.string().required(),
  ctaLabel: yup.string().required(),
  imageUrl: yup.string().required(),
})

export const CtaSectionForm = ({section, onClose}: {section: LandingSection; onClose?: () => void}) => {
  const content = section.content as CtaContent | null
  const update = useUpdateSectionConfig()
  const {register, handleSubmit, setValue, watch} = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      headline: content?.headline ?? '',
      description: content?.description ?? '',
      ctaLabel: content?.ctaLabel ?? '',
      imageUrl: content?.imageUrl ?? '',
    },
  })

  const onSubmit = async (data: CtaContent) => {
    try {
      await update.mutateAsync({sectionKey: 'cta', content: data as unknown as Record<string, unknown>})
      toast.success('CTA section saved')
      onClose?.()
    } catch {
      toast.error('Failed to save CTA section')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
      <div><Label>Headline</Label><Input {...register('headline')} /></div>
      <div><Label>Description</Label><Textarea {...register('description')} rows={2} /></div>
      <div><Label>CTA Button Label</Label><Input {...register('ctaLabel')} /></div>
      <ImageUploadField
        label='CTA Image'
        value={watch('imageUrl')}
        onChange={url => setValue('imageUrl', url)}
      />
      <Button type='submit' disabled={update.isPending}>
        {update.isPending ? 'Saving...' : 'Save'}
      </Button>
    </form>
  )
}
