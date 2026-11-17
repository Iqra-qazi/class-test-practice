import { ArrowRight, CalendarDays, Stethoscope, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import { useAdminStats } from '../../hooks/useAdminStats'
import DashboardLayout from '../../components/layout/DashboardLayout'
import ErrorState from '../../components/ui/ErrorState'
import StatCard from '../../components/ui/StatCard'

function StatsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="h-32 animate-pulse rounded-2xl border border-clinic-line bg-white" />
      ))}
    </div>
  )
}

const quickLinks = [
  {
    to: '/admin/users',
    title: 'Manage users',
    description: 'Review accounts, add doctors, and manage access.',
    icon: Users,
  },
  {
    to: '/admin/appointments',
    title: 'All appointments',
    description: 'View appointments across the clinic.',
    icon: CalendarDays,
  },
]

export default function AdminDashboardPage() {
  const { user } = useAuth()
  const { stats, isLoading, error, retry } = useAdminStats()

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-7">
        <section className="rounded-3xl bg-clinic-navy p-6 text-white shadow-card sm:p-9">
          <p className="text-sm font-semibold text-clinic-ivory/75">Administrator workspace</p>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl">Welcome, {user?.name || 'Administrator'}.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-clinic-ivory/80 sm:text-base">
            A clear view of clinic activity, with the tools to keep people and appointments organized.
          </p>
        </section>

        <section aria-labelledby="clinic-stats-heading">
          <div className="mb-4">
            <h2 id="clinic-stats-heading" className="font-display text-2xl text-clinic-navy">Clinic overview</h2>
            <p className="mt-1 text-sm text-clinic-muted">Current totals from the clinic records.</p>
          </div>
          {isLoading ? (
            <StatsSkeleton />
          ) : error ? (
            <ErrorState title="Clinic statistics unavailable" message={error} onRetry={retry} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard label="Patients" value={stats?.patients ?? 0} icon={<Users size={20} />} tone="teal" />
              <StatCard label="Doctors" value={stats?.doctors ?? 0} icon={<Stethoscope size={20} />} tone="green" />
              <StatCard label="Appointments" value={stats?.appointments ?? 0} icon={<CalendarDays size={20} />} tone="gold" />
            </div>
          )}
        </section>

        <section aria-labelledby="quick-actions-heading">
          <div className="mb-4">
            <h2 id="quick-actions-heading" className="font-display text-2xl text-clinic-navy">Quick actions</h2>
            <p className="mt-1 text-sm text-clinic-muted">Go directly to the areas you manage most.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {quickLinks.map(({ to, title, description, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="group flex items-center justify-between gap-4 rounded-2xl border border-clinic-line bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:border-clinic-teal/40 hover:shadow-lg"
              >
                <span className="flex min-w-0 items-center gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-clinic-teal/10 text-clinic-teal">
                    <Icon size={21} aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-display text-lg text-clinic-navy">{title}</span>
                    <span className="mt-1 block text-sm leading-5 text-clinic-muted">{description}</span>
                  </span>
                </span>
                <ArrowRight size={18} className="shrink-0 text-clinic-muted transition group-hover:translate-x-1 group-hover:text-clinic-teal" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}
