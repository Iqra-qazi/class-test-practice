export default function StatCard({
  label,
  value,
  icon,
  tone = 'teal',
  detail,
}) {
  const tones = {
    teal: 'bg-clinic-teal/10 text-clinic-teal',
    gold: 'bg-clinic-gold/15 text-clinic-gold',
    green: 'bg-clinic-success/10 text-clinic-success',
    amber: 'bg-clinic-pending/10 text-clinic-pending',
    red: 'bg-clinic-danger/10 text-clinic-danger',
    gray: 'bg-clinic-neutral/10 text-clinic-neutral',
  }

  return (
    <article className="rounded-2xl border border-clinic-line bg-white p-5 shadow-card transition-shadow hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-clinic-muted">{label}</p>
          <p className="mt-2 font-display text-3xl text-clinic-navy">{value ?? '—'}</p>
        </div>
        {icon && (
          <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${tones[tone] ?? tones.teal}`}>
            {icon}
          </span>
        )}
      </div>
      {detail && <p className="mt-3 text-xs text-clinic-muted">{detail}</p>}
    </article>
  )
}
