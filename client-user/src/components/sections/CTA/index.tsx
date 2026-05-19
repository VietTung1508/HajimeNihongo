import Container from '@/components/layout/Container'
import {Button} from '@/components/ui/button'
import Image from 'next/image'
import {CtaContent} from '@/types/landing'

interface Props {
  content: CtaContent | null
}

const DEFAULT: CtaContent = {
  headline: 'Ready to jump in with us?',
  description: '',
  ctaLabel: 'Try HajimeNihongo',
  imageUrl: '/assets/landing-page/marketing.png',
}

const CTA = ({content}: Props) => {
  const {headline, ctaLabel, imageUrl} = content ?? DEFAULT
  return (
    <Container className='flex flex-col items-center justify-center mb-5'>
      <Image src={imageUrl} alt='cta_image' width={800} height={800} className='object-cover' />
      <p className='text-[19px] mb-2'>{headline}</p>
      <Button>{ctaLabel}</Button>
    </Container>
  )
}

export default CTA
