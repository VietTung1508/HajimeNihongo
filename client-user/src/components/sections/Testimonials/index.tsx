import Container from '@/components/layout/Container'
import {Testimonial} from './types'
import TestimonialCard from './components/TestimonialCard'
import {Separator} from '@/components/ui/separator'

export const testimonials: Testimonial[] = [
  {
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    content:
      'This platform completely changed the way I learn. The lessons are structured clearly, and I can immediately apply what I study in real conversations.',
    name: 'Emily Carter',
    userTitle: 'University Student',
  },
  {
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    content:
      'I’ve tried many online courses before, but this one finally made things click for me. The step-by-step progression keeps me motivated.',
    name: 'Daniel Thompson',
    userTitle: 'Frontend Developer',
  },
  {
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    content:
      'The quizzes are my favorite part. They help me retain grammar naturally instead of just memorizing rules.',
    name: 'Sophia Martinez',
    userTitle: 'Marketing Specialist',
  },
  {
    avatar: 'https://randomuser.me/api/portraits/men/75.jpg',
    content:
      'I only study 20–30 minutes a day, but the consistency and clarity of the lessons helped me improve faster than I expected.',
    name: 'Michael Lee',
    userTitle: 'Product Designer',
  },
  {
    avatar: 'https://randomuser.me/api/portraits/women/21.jpg',
    content:
      'The learning path removes all confusion. I always know what to study next, which makes the journey smooth and enjoyable.',
    name: 'Ava Nguyen',
    userTitle: 'High School Teacher',
  },
]

const Testimonials = () => {
  return (
    <div className='bg-[#082630] py-32 px-6'>
      <Container>
        <div className='mb-14'>
          {/* 'image here below text and text centered */}
          <h1 className='text-[38px] font-semibold text-white'>
            What our users have to say...
          </h1>
        </div>
        <div className='flex flex-col gap-12 px-10'>
          {testimonials.map((testimo, index) => (
            <div key={index}>
              <TestimonialCard
                testimonial={testimo}
                isReverse={index % 2 === 0 ? false : true}
              />

              {index < testimonials.length - 1 && (
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
