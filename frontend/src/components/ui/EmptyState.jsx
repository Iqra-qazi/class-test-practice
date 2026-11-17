import { Inbox } from 'lucide-react'

export default function EmptyState({
  title = 'Nothing here yet',
  description,
  icon,
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-clinic-line bg-white px-6 py-10 text-center">
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-clinic-teal/10 text-clinic-teal">
        {icon ?? <Inbox size={21} aria-hidden="true" />}
      </span>
      <h3 className="font-display text-xl text-clinic-navy">{title}</h3>
      {description && <p className="mt-2 max-w-md text-sm leading-6 text-clinic-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
