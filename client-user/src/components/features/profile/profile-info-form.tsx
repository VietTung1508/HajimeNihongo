'use client'

import {useMemo} from 'react'
import {useForm, Controller} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import {z} from 'zod'
import {useAppDispatch, useAppSelector} from '@/redux/hooks'
import {updateUserProfile} from '@/redux/auth/authSlice'
import {setUser} from '@/lib/api/apiClient'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select'
import {Lock} from 'lucide-react'
import {toast} from 'sonner'
import {useUpdateProfile} from './hooks/use-profile'

const PHONE_REGEX = /^\+?[\d\s\-()+]{7,20}$/

function createProfileSchema(originalUsername: string) {
  return z
    .object({
      username: z.string().min(1, 'Username cannot be empty'),
      phoneNumber: z
        .string()
        .min(1, 'Phone number is required')
        .refine((val) => PHONE_REGEX.test(val), 'Invalid phone number format'),
      gender: z.enum(['MALE', 'FEMALE', 'OTHER'], {error: 'Gender is required'}),
      dateOfBirth: z
        .string()
        .min(1, 'Date of birth is required')
        .refine((val) => !isNaN(Date.parse(val)), 'Invalid date'),
    })
    .superRefine((data, ctx) => {
      const usernameChanged = data.username.trim() !== originalUsername
      if (!usernameChanged) return
      if (!data.phoneNumber) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Phone number is required when changing username',
          path: ['phoneNumber'],
        })
      }
      if (!data.gender) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Gender is required when changing username',
          path: ['gender'],
        })
      }
      if (!data.dateOfBirth) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Date of birth is required when changing username',
          path: ['dateOfBirth'],
        })
      }
    })
}

type ProfileFormValues = {
  username: string
  phoneNumber: string
  gender: 'MALE' | 'FEMALE' | 'OTHER'
  dateOfBirth: string
}

export function ProfileInfoForm() {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)
  const {mutate: updateProfile, isPending} = useUpdateProfile()

  const schema = useMemo(
    () => createProfileSchema(user?.username ?? ''),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: {errors},
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: user?.username ?? '',
      phoneNumber: user?.phoneNumber ?? '',
      gender: (user?.gender as ProfileFormValues['gender']) ?? undefined,
      dateOfBirth: user?.dateOfBirth ?? '',
    },
  })

  const onSubmit = (values: ProfileFormValues) => {
    updateProfile(
      {
        username: values.username,
        phoneNumber: values.phoneNumber,
        gender: values.gender,
        dateOfBirth: values.dateOfBirth,
      },
      {
        onSuccess: (data) => {
          dispatch(
            updateUserProfile({
              username: data.username,
              phoneNumber: data.phoneNumber,
              gender: data.gender,
              dateOfBirth: data.dateOfBirth,
            }),
          )
          if (user)
            setUser({
              ...user,
              username: data.username,
              phoneNumber: data.phoneNumber,
              gender: data.gender,
              dateOfBirth: data.dateOfBirth,
            })
          toast.success('Profile updated')
        },
        onError: (err: any) => {
          setError('root', {
            message: err?.response?.data?.message ?? 'Failed to update profile',
          })
        },
      },
    )
  }

  return (
    <>
      <h3 className='text-base font-semibold text-gray-900 mb-1'>Account Info</h3>
      <p className='text-sm text-gray-500 mb-5'>Update your display name and personal details.</p>
      <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5'>
        <div className='flex flex-col gap-1.5'>
          <Label htmlFor='email' className='text-sm font-medium text-gray-700'>
            Email
          </Label>
          <div className='relative'>
            <Input
              id='email'
              value={user?.email ?? ''}
              disabled
              className='bg-gray-50 border-gray-200 text-gray-500 pr-10 cursor-not-allowed'
            />
            <Lock className='absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
          </div>
          <p className='text-xs text-gray-400'>Email cannot be changed.</p>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='username' className='text-sm font-medium text-gray-700'>
              Username
            </Label>
            <Input
              id='username'
              {...register('username')}
              className='bg-white border-gray-200 text-gray-900 focus:border-teal-500'
            />
            {errors.username && <p className='text-red-500 text-xs'>{errors.username.message}</p>}
          </div>

          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='phone' className='text-sm font-medium text-gray-700'>
              Phone Number
            </Label>
            <Input
              id='phone'
              type='tel'
              {...register('phoneNumber')}
              className='bg-white border-gray-200 text-gray-900 focus:border-teal-500'
            />
            {errors.phoneNumber && (
              <p className='text-red-500 text-xs'>{errors.phoneNumber.message}</p>
            )}
          </div>

          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='gender' className='text-sm font-medium text-gray-700'>
              Gender
            </Label>
            <Controller
              name='gender'
              control={control}
              render={({field}) => (
                <Select
                  value={field.value ?? ''}
                  onValueChange={(val) => field.onChange(val || null)}
                >
                  <SelectTrigger
                    id='gender'
                    style={{width: '100%'}}
                    className='bg-white border-gray-200 text-gray-900 focus:border-teal-500'
                  >
                    <SelectValue placeholder='Select gender' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='MALE'>Male</SelectItem>
                    <SelectItem value='FEMALE'>Female</SelectItem>
                    <SelectItem value='OTHER'>Other</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.gender && <p className='text-red-500 text-xs'>{errors.gender.message}</p>}
          </div>

          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='dob' className='text-sm font-medium text-gray-700'>
              Date of Birth
            </Label>
            <Input
              id='dob'
              type='date'
              {...register('dateOfBirth')}
              className='bg-white border-gray-200 text-gray-900 focus:border-teal-500'
            />
            {errors.dateOfBirth && (
              <p className='text-red-500 text-xs'>{errors.dateOfBirth.message}</p>
            )}
          </div>
        </div>

        {errors.root && <p className='text-red-500 text-sm'>{errors.root.message}</p>}

        <div className='flex justify-end'>
          <Button type='submit' disabled={isPending} className='bg-teal-600 hover:bg-teal-700'>
            {isPending ? 'Saving...' : 'Save changes'}
          </Button>
        </div>
      </form>
    </>
  )
}
