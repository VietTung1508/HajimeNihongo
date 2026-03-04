'use client'

import {z} from 'zod'
import {zodResolver} from '@hookform/resolvers/zod'
import {useForm} from 'react-hook-form'
import {Separator} from '@/components/ui/separator'
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
import {Button} from '@/components/ui/button'
import {Eye, EyeOff, KeyRound} from 'lucide-react'
import {useState} from 'react'
import Container from '@/components/layout/Container'
import {passwordRegex} from '@/lib/regex'
import {useAuth} from './hook/useAuth'

const signUpSchema = z
  .object({
    username: z.string().min(1, 'Please enter a username'),
    email: z
      .string()
      .min(1, 'Please enter your email address')
      .email('Invalid email address'),
    password: z
      .string()
      .regex(
        passwordRegex,
        'Password must be at least 8 characters, include 1 uppercase letter, 1 number, and 1 special character',
      ),
    confirmPassword: z.string().min(1, 'Please enter your confirm password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type SignUpFormValues = z.infer<typeof signUpSchema>

const SignUpMain = () => {
  const {register, loading} = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const form = useForm<SignUpFormValues>({
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    resolver: zodResolver(signUpSchema),
    mode: 'onBlur',
  })

  const onSubmit = async (data: SignUpFormValues) => {
    try {
      await register({
        username: data.username,
        email: data.email,
        password: data.password,
      })
      form.reset()
    } catch (e) {
      console.log(e)
    }
  }

  return (
    <div className="h-screen bg-[url('/assets/auth/sign_up_bg.png')] bg-cover bg-top bg-no-repeat">
      <Container className='pt-10'>
        <div className='w-full md:w-4/12 bg-white rounded-md p-5'>
          <h2 className='font-semibold text-[28px]'>
            Welcome to HajimeNihongo
          </h2>
          <p className='text-base mt-1'>
            Sign up to start our free trial packagae.
          </p>
          <Separator className='my-4 ' />
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-2'>
              {/* Full Name Field */}
              <FormField
                control={form.control}
                name='username'
                render={({field, fieldState}) => (
                  <FormItem>
                    <FormLabel className='gap-1 text-xs text-gray-900'>
                      Username
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

              {/* Confirm Password Field */}
              <FormField
                control={form.control}
                name='confirmPassword'
                render={({field, fieldState}) => (
                  <FormItem>
                    <FormLabel className='gap-1 text-xs text-gray-900'>
                      Confirm Password
                      <span className='text-red-600'>*</span>
                    </FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <div className='absolute left-4 top-1/2 transform -translate-y-1/2'>
                          <KeyRound className='h-4 w-4 text-gray-400' />
                        </div>
                        <Input
                          {...field}
                          type={showConfirmPassword ? 'text' : 'password'}
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
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className='absolute right-4 top-1/2 transform -translate-y-1/2'
                        >
                          {showConfirmPassword ? (
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
            </form>
          </Form>
          <div className='flex flex-col gap-1 mt-4'>
            <p className='text-xs'>
              Your data is protected by our{' '}
              <span className='text-[#C74A4A]'>Privacy Policy</span>
            </p>
            <p className='text-xs'>
              By continuing, you agree to the{' '}
              <span className='text-[#C74A4A]'>Terms of Service</span>
            </p>
          </div>
        </div>
      </Container>
    </div>
  )
}

export default SignUpMain
