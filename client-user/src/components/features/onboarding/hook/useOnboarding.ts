import {useQuery, useQueryClient} from '@tanstack/react-query'
import {onboardingApi} from '@/components/features/onboarding/services/api'
import {useAppDispatch} from '@/redux/hooks'
import {onboardingThunk} from '@/redux/auth/authSlice'
import {learnApi} from '@/components/features/learn/services/api'
import {toast} from 'sonner'

export const useOnboardingQuery = () => {
  return useQuery({
    queryKey: ['onboarding-query'],
    queryFn: () => onboardingApi.getOnboardingData(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useOnboarding() {
  const dispatch = useAppDispatch()
  const queryClient = useQueryClient()

  const completeOnboarding = async (data: any) => {
    const result = await dispatch(onboardingThunk(data))

    if (onboardingThunk.fulfilled.match(result)) {
      queryClient.invalidateQueries({queryKey: ['onboarding']})

      try {
        const dailyLearn = await learnApi.generateDailyLearn()
        if (dailyLearn.id && dailyLearn.items.length > 0) {
          toast.success(`Generated ${dailyLearn.items.length} learning items to get you started!`)
        }
      } catch (error) {
        console.error('Failed to generate initial daily learn:', error)
      }
    }

    return result
  }

  return {
    completeOnboarding,
  }
}
