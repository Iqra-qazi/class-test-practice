import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/useAuth'
import { getDashboardPath } from '../../utils/roleRoutes'
import AuthField from '../../components/AuthField'
import AuthLayout from './AuthLayout'

function getErrorMessage(error) {
  const responseMessage = error?.response?.data?.message
  if (typeof responseMessage === 'string' && responseMessage.trim()) {
    return responseMessage
  }
  if (typeof error?.message === 'string' && error.message.trim()) {
    return error.message
  }
  return 'Unable to sign in. Please try again.'
}

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [values, setValues] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  function validate() {
    const nextErrors = {}
    const email = String(values?.email ?? '').trim()
    const password = String(values?.password ?? '')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = 'Enter a valid email address.'
    }
    if (!password) {
      nextErrors.password = 'Enter your password.'
    }
    return nextErrors
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setIsSubmitting(true)
    try {
      const user = await login({
        email: String(values?.email ?? '').trim(),
        password: String(values?.password ?? ''),
      })
      toast.success(`Welcome back, ${user.name}.`)
      navigate(getDashboardPath(user.role), { replace: true })
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  function updateField(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...(current ?? {}), [name]: value }))
    setErrors((current) => ({ ...(current ?? {}), [name]: undefined }))
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue to your clinic account."
      footer={(
        <>
          New to the clinic?{' '}
          <Link className="font-semibold text-clinic-teal hover:text-clinic-navy" to="/register">
            Create a patient account
          </Link>
        </>
      )}
    >
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <AuthField
          id="email"
          label="Email address"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={values.email}
          onChange={updateField}
          error={errors.email}
        />
        <AuthField
          id="password"
          label="Password"
          type="password"
          name="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={values.password}
          onChange={updateField}
          error={errors.password}
        />
        <button
          className="flex w-full items-center justify-center rounded-xl bg-clinic-navy px-4 py-3 text-sm font-semibold text-white transition hover:bg-clinic-teal focus:outline-none focus:ring-2 focus:ring-clinic-teal focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </AuthLayout>
  )
}
