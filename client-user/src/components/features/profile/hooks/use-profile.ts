import {useMutation} from '@tanstack/react-query'
import {profileApi} from '../services/api'

export function useUpdateUsername() {
  return useMutation({
    mutationFn: (username: string) => profileApi.updateUsername(username),
  })
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: (data: {currentPassword: string; newPassword: string}) =>
      profileApi.updatePassword(data),
  })
}

export function useUploadAvatar() {
  return useMutation({
    mutationFn: (file: File) => profileApi.uploadAvatar(file),
  })
}
