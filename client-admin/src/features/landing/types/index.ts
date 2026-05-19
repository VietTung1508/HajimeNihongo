export interface FeatureItem {
  title: string
  desc: string
  iconUrl: string
}

export interface HeroContent {
  headline: string
  subheadline: string
  ctaLabel: string
  imageUrl: string
  features?: FeatureItem[]
}

export interface ChatbotContent {
  badge: string
  heading: string
  description: string
  ctaLabel: string
}

export interface CtaContent {
  headline: string
  description: string
  ctaLabel: string
  imageUrl: string
}

export interface TestimonialItem {
  id: number
  name: string
  userTitle: string
  content: string
  avatarUrl?: string
  position: number
}

export type SectionKey = 'hero' | 'testimonials' | 'chatbot' | 'cta'

export interface LandingSection {
  sectionKey: SectionKey
  content: HeroContent | ChatbotContent | CtaContent | null
  position: number
  items?: TestimonialItem[]
}

export interface LandingData {
  sections: LandingSection[]
}
