import { AlertCircle } from 'lucide-react'
import Button from './Button'

export default function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
}) {
  return (
    <div className="rounded-2xl border border-clinic-danger/20 bg-white px-6 py-8 text-center shadow-sm">
      <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-clinic-danger/10 text-clinic-danger">
        <AlertCircle size={20} aria-hidden="true" />
      </span>
      <h2 className="mt-4 font-display text-xl text-clinic-navy">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-clinic-muted" role="alert">
        {message}
      </p>
      {onRetry && <Button variant="secondary" className="mt-5" onClick={onRetry}>Try again</Button>}
    </div>
  )
}
