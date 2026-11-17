import { LoaderCircle } from 'lucide-react'

export function Loader({ label = 'Loading…', className = '' }) {
  return (
    <div className={`flex items-center justify-center gap-3 py-8 text-sm text-clinic-muted ${className}`} role="status">
      <LoaderCircle size={20} className="animate-spin text-clinic-teal" aria-hidden="true" />
      <span>{label}</span>
    </div>
  )
}

export function Skeleton({ rows = 3, className = '' }) {
  return (
    <div className={`space-y-3 ${className}`} aria-label="Loading content" role="status">
      {Array.from({ length: Math.max(0, rows) }, (_, index) => (
        <div
          key={index}
          className="h-14 animate-pulse rounded-xl bg-clinic-line/70"
        />
      ))}
      <span className="sr-only">Loading content</span>
    </div>
  )
}
