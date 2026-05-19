import {ChatbotContent} from '@/types/landing'
import Container from '@/components/layout/Container'
import {Button} from '@/components/ui/button'
import Link from 'next/link'

interface Props {
  content: ChatbotContent | null
}

const DEFAULT: ChatbotContent = {
  badge: 'New Feature',
  heading: 'Learn faster with AI-powered chat',
  description: 'Ask anything about Japanese grammar, vocabulary, and culture. Your personal tutor, always on.',
  ctaLabel: 'Start chatting free',
}

// Static decorative chat messages — not CMS-managed
const MOCK_CHAT = [
  {role: 'bot', text: 'どうぞよろしく！何を学びたいですか？'},
  {role: 'user', text: 'てform を練習したい！'},
  {role: 'bot', text: 'いいですね！食べる → 食べて…'},
]

const AIChatbot = ({content}: Props) => {
  const {badge, heading, description, ctaLabel} = content ?? DEFAULT
  return (
    <section className='relative overflow-hidden bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] py-24'>
      <div className='pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-[#00b4d8] opacity-10' />
      <div className='pointer-events-none absolute -bottom-8 left-12 h-40 w-40 rounded-full bg-[#6c63ff] opacity-15' />
      <Container>
        <div className='flex flex-col items-center gap-12 lg:flex-row'>
          <div className='flex-[1.2] space-y-5'>
            <span className='inline-block rounded-full bg-[#00b4d8]/20 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-[#00b4d8]'>
              {badge}
            </span>
            <h2 className='text-4xl font-extrabold leading-tight text-white lg:text-5xl'>
              {heading}
            </h2>
            <p className='max-w-md text-base text-slate-400'>{description}</p>
            <Button
              asChild
              className='bg-gradient-to-r from-[#e94560] to-[#6c63ff] text-white hover:opacity-90'
            >
              <Link href='/signup'>{ctaLabel}</Link>
            </Button>
          </div>
          <div className='w-full max-w-sm flex-[0.8]'>
            <div className='rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md'>
              <div className='mb-4 flex items-center gap-3 border-b border-white/10 pb-3'>
                <div className='flex h-8 w-8 items-center justify-center rounded-full bg-[#00b4d8] text-sm'>
                  🤖
                </div>
                <span className='text-sm font-semibold text-white'>AI Sensei</span>
                <div className='ml-auto h-2 w-2 rounded-full bg-emerald-400' />
              </div>
              <div className='flex flex-col gap-2'>
                {MOCK_CHAT.map((msg, i) => (
                  <div
                    key={i}
                    className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                      msg.role === 'bot'
                        ? 'bg-white/5 text-slate-200'
                        : 'ml-auto bg-[#6c63ff] text-white'
                    }`}
                  >
                    {msg.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}

export default AIChatbot
