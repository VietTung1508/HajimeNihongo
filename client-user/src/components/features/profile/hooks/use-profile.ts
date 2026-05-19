import {useMutation} from '@tanstack/react-query'
import {profileApi} from '../services/api'

export function useUpdateProfile() {
  return useMutation({
    mutationFn: (data: {
      username: string
      phoneNumber?: string | null
      gender?: string | null
      dateOfBirth?: string | null
    }) => profileApi.updateProfile(data),
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
