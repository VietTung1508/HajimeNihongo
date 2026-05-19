import {LandingData} from '@/types/landing'

export async function fetchLandingData(): Promise<LandingData> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/landing`, {
      cache: 'no-store',
    })
    if (!res.ok) return {sections: []}
    return res.json()
  } catch {
    return {sections: []}
  }
}
