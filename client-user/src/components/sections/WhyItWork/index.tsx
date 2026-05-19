import Container from '@/components/layout/Container'
import type {FeatureItem} from '@/types/landing'

const DEFAULT_FEATURES: FeatureItem[] = [
  {
    title: 'Understand Japanese with AI Chat Support You',
    desc: 'Ask anything about grammar, sentence structure, or word meaning. Our interactive chatbox explains Japanese clearly and naturally, just like a personal tutor.',
    iconUrl: '/assets/landing-page/book.png',
  },
  {
    title: 'Master Kanji and Vocabulary Step by Step With Ease',
    desc: 'Learn kanji readings, meanings, and usage alongside essential vocabulary. Build a strong foundation that helps you read and understand Japanese confidently.',
    iconUrl: '/assets/landing-page/hills.png',
  },
  {
    title: 'Track Your Learning Progress',
    desc: "Stay motivated with structured lessons and visible progress tracking. See how far you've come and keep moving forward with a clear learning path.",
    iconUrl: '/assets/landing-page/feedbacks.png',
  },
]

interface Props {
  features?: FeatureItem[]
}

const WhyItWork = ({features}: Props) => {
  const items = features && features.length > 0 ? features : DEFAULT_FEATURES

  return (
    <div className='bg-[#082530]'>
      <Container className='pt-10 pb-32'>
        <h2 className='text-[28px] pb-2 text-white'>Why it works</h2>
        <div className='flex items-center gap-4'>
          {items.map(item => (
            <div
              key={item.title}
              className='bg-white rounded-2xl p-6 flex flex-col items-center justify-center gap-2 min-h-83.5'
            >
              {item.iconUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img width={144} height={144} src={item.iconUrl} alt={item.title} className='object-contain' />
              )}
              <div className='space-y-2'>
                <h3 className='font-semibold text-2xl text-center'>{item.title}</h3>
                <p className='text-sm text-center'>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </div>
  )
}

export default WhyItWork
