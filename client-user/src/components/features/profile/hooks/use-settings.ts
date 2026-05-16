import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query'
import {onboardingApi} from '@/components/features/onboarding/services/api'
import {profileApi} from '../services/api'

export function useOnboarding() {
  return useQuery({
    queryKey: ['onboarding-me'],
    queryFn: onboardingApi.getOnboardingData,
  })
}

export function useUpdateOnboarding() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: profileApi.updateOnboarding,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['onboarding-me']})
    },
  })
}
