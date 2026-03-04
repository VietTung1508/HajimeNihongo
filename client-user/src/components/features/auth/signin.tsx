'use client'

import {zodResolver} from '@hookform/resolvers/zod'
import {useForm} from 'react-hook-form'
import z from 'zod'
import {useAuth} from './hook/useAuth'
import {Button} from '@/components/ui/button'
import {useState} from 'react'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {Input} from '@/components/ui/input'
import {cn} from '@/lib/utils'
import {Eye, EyeOff, KeyRound} from 'lucide-react'
import Link from 'next/link'

const SignInSchema = z.object({
  email: z
    .string()
    .min(1, 'Please enter your email address')
    .email('Invalid email address'),
  password: z.string().min(1, 'Please enter your password'),
})

type SignInFormValues = z.infer<typeof SignInSchema>

const SignInMain = () => {
  const [showPassword, setShowPassword] = useState(false)
  const {login, loading} = useAuth()
  const form = useForm<SignInFormValues>({
    defaultValues: {
      email: '',
      password: '',
    },
    resolver: zodResolver(SignInSchema),
    mode: 'onBlur',
  })

  const onSubmit = async (data: SignInFormValues) => {
    try {
      await login({
        email: data.email,
        password: data.password,
      })
      form.reset()
    } catch (e) {
      console.log(e)
    }
  }

  return (
    <div className='flex items-start justify-center bg-[#e7e8ea] h-full pb-30'>
      <div className='mt-10 w-110 bg-white rounded-md p-6'>
        <h2 className='font-semibold text-[28px] mb-3'>Log in</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-2'>
            {/* Full Name Field */}
            <FormField
              control={form.control}
              name='email'
              render={({field, fieldState}) => (
                <FormItem>
                  <FormLabel className='gap-1 text-xs text-gray-900'>
                    Email
                    <span className='text-red-600'>*</span>
                  </FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <Input
                        {...field}
                        type='text'
                        className={cn(
                          'pr-4 h-8 rounded-md',
                          fieldState.invalid
                            ? 'border-red-600! focus:ring-0!'
                            : 'border-gray-300',
                        )}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password Field */}
            <FormField
              control={form.control}
              name='password'
              render={({field, fieldState}) => (
                <FormItem>
                  <FormLabel className='gap-1 text-xs text-gray-900'>
                    Password
                    <span className='text-red-600'>*</span>
                  </FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <div className='absolute left-4 top-1/2 transform -translate-y-1/2'>
                        <KeyRound className='h-4 w-4 text-gray-400' />
                      </div>
                      <Input
                        {...field}
                        type={showPassword ? 'text' : 'password'}
                        className={cn(
                          'pl-12 pr-12 h-8 rounded-md hide-edge-eye',
                          fieldState.invalid
                            ? 'border-red-600! focus:ring-0!'
                            : 'border-gray-300',
                        )}
                        maxLength={20}
                      />
                      <button
                        type='button'
                        onClick={() => setShowPassword(!showPassword)}
                        className='absolute right-4 top-1/2 transform -translate-y-1/2'
                      >
                        {showPassword ? (
                          <EyeOff className='h-4 w-4 text-gray-400' />
                        ) : (
                          <Eye className='h-4 w-4 text-gray-400' />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Sign Up Button */}
            <Button disabled={loading} className='w-full mt-1' type='submit'>
              Continue
            </Button>

            <div className='text-xs'>
              New user?{' '}
              <Link href='/signup'>
                <span className='text-[#C74A4A]'>Sign up now!</span>
              </Link>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}

export default SignInMain
