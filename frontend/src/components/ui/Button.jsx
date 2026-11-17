import { LoaderCircle } from 'lucide-react'

const variants = {
  primary: 'bg-clinic-navy text-white hover:bg-clinic-teal focus-visible:ring-clinic-teal',
  secondary: 'border border-clinic-line bg-white text-clinic-navy hover:border-clinic-teal hover:bg-clinic-teal/5 focus-visible:ring-clinic-teal',
  ghost: 'bg-transparent text-clinic-teal hover:bg-clinic-teal/10 focus-visible:ring-clinic-teal',
  danger: 'bg-clinic-danger text-white hover:bg-red-800 focus-visible:ring-clinic-danger',
}

export default function Button({
  children,
  variant = 'primary',
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant] ?? variants.primary} ${className}`}
      {...props}
    >
      {loading && <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />}
      {children}
    </button>
  )
}
