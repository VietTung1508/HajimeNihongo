import {useForm} from 'react-hook-form'
import {yupResolver} from '@hookform/resolvers/yup'
import * as yup from 'yup'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {Textarea} from '@/components/ui/textarea'
import {toast} from 'sonner'
import {useUpdateSectionConfig} from '../hooks/use-landing-api'
import type {ChatbotContent, LandingSection} from '../types'

const schema = yup.object({
  badge: yup.string().required(),
  heading: yup.string().required(),
  description: yup.string().required(),
  ctaLabel: yup.string().required(),
})

export const ChatbotSectionForm = ({section, onClose}: {section: LandingSection; onClose?: () => void}) => {
  const content = section.content as ChatbotContent | null
  const update = useUpdateSectionConfig()
  const {register, handleSubmit} = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      badge: content?.badge ?? '',
      heading: content?.heading ?? '',
      description: content?.description ?? '',
      ctaLabel: content?.ctaLabel ?? '',
    },
  })

  const onSubmit = async (data: ChatbotContent) => {
    try {
      await update.mutateAsync({sectionKey: 'chatbot', content: data as unknown as Record<string, unknown>})
      toast.success('AI Chatbot section saved')
      onClose?.()
    } catch {
      toast.error('Failed to save chatbot section')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
      <div><Label>Badge Label</Label><Input {...register('badge')} /></div>
      <div><Label>Heading</Label><Textarea {...register('heading')} rows={2} /></div>
      <div><Label>Description</Label><Textarea {...register('description')} rows={3} /></div>
      <div><Label>CTA Button Label</Label><Input {...register('ctaLabel')} /></div>
      <Button type='submit' disabled={update.isPending}>
        {update.isPending ? 'Saving...' : 'Save'}
      </Button>
    </form>
  )
}
