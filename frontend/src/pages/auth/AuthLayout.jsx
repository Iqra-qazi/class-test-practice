import { HeartPulse } from 'lucide-react'

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-clinic-ivory px-4 py-10 sm:px-6">
      <div className="w-full max-w-md">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-clinic-teal text-white shadow-card">
            <HeartPulse size={23} strokeWidth={1.8} aria-hidden="true" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clinic-gold">
            Clinic appointment management
          </p>
        </div>

        <section className="rounded-3xl border border-clinic-line bg-white p-6 shadow-card sm:p-9">
          <h1 className="font-display text-3xl text-clinic-navy">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-clinic-muted">{subtitle}</p>
          <div className="mt-7">{children}</div>
          {footer && (
            <div className="mt-6 border-t border-clinic-line pt-5 text-center text-sm text-clinic-muted">
              {footer}
            </div>
          )}
        </section>
        <p className="mt-6 text-center text-xs text-clinic-muted">
          Secure access for patients and care teams
        </p>
      </div>
    </main>
  )
}
