import { LearnItem, LearnTodayResponse, StreakResponse } from './services/api'

export type { LearnItem, LearnTodayResponse, StreakResponse }

export type ItemState = 'locked' | 'viewable' | 'viewed'

export interface ExtendedLearnItem extends LearnItem {
  state: ItemState
}
