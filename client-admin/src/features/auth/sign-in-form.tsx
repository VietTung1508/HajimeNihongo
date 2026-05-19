import {useForm} from 'react-hook-form'
import {yupResolver} from '@hookform/resolvers/yup'
import * as yup from 'yup'
import {useNavigate} from '@tanstack/react-router'
import {useState} from 'react'
import {login} from '@/lib/api/auth-service'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Card, CardContent, CardDescription, CardHeader} from '@/components/ui/card'

const schema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().min(1, 'Password is required').required('Password is required'),
})

type FormValues = yup.InferType<typeof schema>

const SignInForm = () => {
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: {errors, isSubmitting},
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
  })

  const onSubmit = async (data: FormValues) => {
    setServerError(null)
    try {
      await login(data.email, data.password)
      await navigate({to: '/'})
    } catch (err: any) {
      const status = err?.response?.status
      if (status === 401) setServerError('Invalid email or password.')
      else if (status === 403) setServerError('Access denied. Admin accounts only.')
      else setServerError('Something went wrong. Please try again.')
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          {/* App logo / name */}
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
              は
            </div>
            <span className="text-xl font-bold tracking-tight">HajimeNihongo</span>
          </div>
          <CardDescription>Sign in with your admin credentials</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* Email */}
            <div className="space-y-1">
              <Input
                type="email"
                placeholder="Email"
                disabled={isSubmitting}
                aria-invalid={!!errors.email}
                className={errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1">
              <Input
                type="password"
                placeholder="Password"
                disabled={isSubmitting}
                aria-invalid={!!errors.password}
                className={errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}
                {...register('password')}
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            {/* Server error */}
            {serverError && (
              <p className="text-sm text-destructive">{serverError}</p>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default SignInForm
