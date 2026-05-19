import {useState} from 'react'
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
import {FeatureListEditor} from './feature-list-editor'
import type {FeatureItem, HeroContent, LandingSection} from '../types'

const DEFAULT_FEATURES: FeatureItem[] = [
  {
    title: 'Understand Japanese with AI Chat Support You',
    desc: 'Ask anything about grammar, sentence structure, or word meaning. Our interactive chatbox explains Japanese clearly and naturally, just like a personal tutor.',
    iconUrl: '',
  },
  {
    title: 'Master Kanji and Vocabulary Step by Step With Ease',
    desc: 'Learn kanji readings, meanings, and usage alongside essential vocabulary. Build a strong foundation that helps you read and understand Japanese confidently.',
    iconUrl: '',
  },
  {
    title: 'Track Your Learning Progress',
    desc: "Stay motivated with structured lessons and visible progress tracking. See how far you’ve come and keep moving forward with a clear learning path.",
    iconUrl: '',
  },
]

const schema = yup.object({
  headline: yup.string().required(),
  subheadline: yup.string().required(),
  ctaLabel: yup.string().required(),
  imageUrl: yup.string().required(),
})

export const HeroSectionForm = ({section, onClose}: {section: LandingSection; onClose?: () => void}) => {
  const content = section.content as HeroContent | null
  const update = useUpdateSectionConfig()

  const {register, handleSubmit, setValue, watch} = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      headline: content?.headline ?? '',
      subheadline: content?.subheadline ?? '',
      ctaLabel: content?.ctaLabel ?? '',
      imageUrl: content?.imageUrl ?? '',
    },
  })

  const [features, setFeatures] = useState<FeatureItem[]>(
    content?.features && content.features.length > 0 ? content.features : DEFAULT_FEATURES,
  )

  const onSubmit = async (data: Omit<HeroContent, 'features'>) => {
    try {
      await update.mutateAsync({
        sectionKey: 'hero',
        content: {...data, features} as unknown as Record<string, unknown>,
      })
      toast.success('Hero section saved')
      onClose?.()
    } catch {
      toast.error('Failed to save hero section')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
      <div><Label>Headline</Label><Textarea {...register('headline')} rows={2} /></div>
      <div><Label>Sub-headline</Label><Textarea {...register('subheadline')} rows={2} /></div>
      <div><Label>CTA Button Label</Label><Input {...register('ctaLabel')} /></div>
      <ImageUploadField
        label='Hero Background Image'
        value={watch('imageUrl')}
        onChange={url => setValue('imageUrl', url)}
      />
      <div className='border-t pt-4'>
        <FeatureListEditor value={features} onChange={setFeatures} />
      </div>
      <Button type='submit' disabled={update.isPending}>
        {update.isPending ? 'Saving...' : 'Save'}
      </Button>
    </form>
  )
}
