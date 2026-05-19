import Container from '@/components/layout/Container'
import {TestimonialItem} from '@/types/landing'
import TestimonialCard from './components/TestimonialCard'
import {Separator} from '@/components/ui/separator'

interface Props {
  items: TestimonialItem[]
}

const Testimonials = ({items}: Props) => {
  if (!items.length) return null
  return (
    <div className='bg-[#082630] py-32 px-6'>
      <Container>
        <div className='mb-14'>
          <h1 className='text-[38px] font-semibold text-white'>
            What our users have to say...
          </h1>
        </div>
        <div className='flex flex-col gap-12 px-10'>
          {items.map((item, index) => (
            <div key={item.id}>
              <TestimonialCard
                testimonial={{
                  avatar: item.avatarUrl ?? '',
                  content: item.content,
                  name: item.name,
                  userTitle: item.userTitle,
                }}
                isReverse={index % 2 !== 0}
              />
              {index < items.length - 1 && (
                <div className='flex items-center justify-center'>
                  <Separator className='my-8 max-w-md' />
                </div>
              )}
            </div>
          ))}
        </div>
      </Container>
    </div>
  )
}

export default Testimonials
