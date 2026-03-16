import {useQuery, useQueryClient} from '@tanstack/react-query'
import {onboardingApi} from '@/components/features/onboarding/services/api'
import {useAppDispatch} from '@/redux/hooks'
import {onboardingThunk} from '@/redux/auth/authSlice'

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
    }

    return result
  }

  return {
    completeOnboarding,
  }
}
