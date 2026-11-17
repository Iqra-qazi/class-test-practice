import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/useAuth'
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
  return 'Unable to create your account. Please try again.'
}

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [values, setValues] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  function validate() {
    const nextErrors = {}
    const name = String(values?.name ?? '').trim()
    const email = String(values?.email ?? '').trim()
    const password = String(values?.password ?? '')
    const confirmPassword = String(values?.confirmPassword ?? '')

    if (name.length < 2) {
      nextErrors.name = 'Name must be at least 2 characters.'
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = 'Enter a valid email address.'
    }
    if (password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters.'
    }
    if (!confirmPassword) {
      nextErrors.confirmPassword = 'Confirm your password.'
    } else if (confirmPassword !== password) {
      nextErrors.confirmPassword = 'Passwords do not match.'
    }
    return nextErrors
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors ?? {}).length > 0) return

    setIsSubmitting(true)
    try {
      await register({
        name: String(values?.name ?? '').trim(),
        email: String(values?.email ?? '').trim(),
        password: String(values?.password ?? ''),
      })
      toast.success('Your patient account is ready.')
      navigate('/patient/dashboard', { replace: true })
    } catch (error) {
      const message = getErrorMessage(error)
      toast.error(message)
      if (error?.response?.status === 409) {
        setErrors((current) => ({ ...(current ?? {}), email: message }))
      }
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
      title="Create your account"
      subtitle="Register as a patient to manage your clinic appointments."
      footer={(
        <>
          Already registered?{' '}
          <Link className="font-semibold text-clinic-teal hover:text-clinic-navy" to="/login">
            Sign in
          </Link>
        </>
      )}
    >
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <AuthField
          id="name"
          label="Full name"
          name="name"
          autoComplete="name"
          placeholder="Your name"
          value={values.name}
          onChange={updateField}
          error={errors.name}
        />
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
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={values.password}
          onChange={updateField}
          error={errors.password}
        />
        <AuthField
          id="confirmPassword"
          label="Confirm password"
          type="password"
          name="confirmPassword"
          autoComplete="new-password"
          placeholder="Re-enter your password"
          value={values.confirmPassword}
          onChange={updateField}
          error={errors.confirmPassword}
        />
        <button
          className="flex w-full items-center justify-center rounded-xl bg-clinic-navy px-4 py-3 text-sm font-semibold text-white transition hover:bg-clinic-teal focus:outline-none focus:ring-2 focus:ring-clinic-teal focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating account…' : 'Create patient account'}
        </button>
      </form>
    </AuthLayout>
  )
}
