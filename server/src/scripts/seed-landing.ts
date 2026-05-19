import 'dotenv/config'
import {MikroORM} from '@mikro-orm/postgresql'
import config from '../mikro-orm.config'
import {LandingConfig, SectionKey} from '../entities/LandingConfig'
import {LandingTestimonial} from '../entities/LandingTestimonial'

async function seed() {
  const orm = await MikroORM.init(config)
  const em = orm.em.fork()

  const defaultSections = [
    {
      sectionKey: SectionKey.HERO,
      content: {
        headline: 'Japanese is complex.\nWe make it simple.',
        subheadline: 'Hajime Nihongo gives you the roadmap and tools you need to attain your learning goals',
        ctaLabel: 'Try HajimeNihongo',
        imageUrl: '/assets/landing-page/landing_hero.png',
      },
      position: 0,
    },
    {sectionKey: SectionKey.TESTIMONIALS, content: null, position: 1},
    {
      sectionKey: SectionKey.CHATBOT,
      content: {
        badge: 'New Feature',
        heading: 'Learn faster with AI-powered chat',
        description: 'Ask anything about Japanese grammar, vocabulary, and culture. Your personal tutor, always on.',
        ctaLabel: 'Start chatting free',
      },
      position: 2,
    },
    {
      sectionKey: SectionKey.CTA,
      content: {
        headline: 'Ready to jump in with us?',
        description: '',
        ctaLabel: 'Try HajimeNihongo',
        imageUrl: '/assets/landing-page/marketing.png',
      },
      position: 3,
    },
  ]

  for (const data of defaultSections) {
    const existing = await em.findOne(LandingConfig, {sectionKey: data.sectionKey})
    if (!existing) em.create(LandingConfig, data as any)
  }

  const testimonialCount = await em.count(LandingTestimonial, {})
  if (testimonialCount === 0) {
    const defaults = [
      {name: 'Emily Carter', userTitle: 'University Student', content: 'This platform completely changed the way I learn.', avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg', position: 0},
      {name: 'Daniel Thompson', userTitle: 'Frontend Developer', content: "I've tried many online courses before, but this one finally made things click.", avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg', position: 1},
      {name: 'Sophia Martinez', userTitle: 'Marketing Specialist', content: 'The quizzes help me retain grammar naturally instead of just memorizing rules.', avatarUrl: 'https://randomuser.me/api/portraits/women/68.jpg', position: 2},
    ]
    for (const t of defaults) em.create(LandingTestimonial, t as any)
  }

  await em.flush()
  console.log('Landing seed complete')
  await orm.close()
}

seed().catch(console.error)
