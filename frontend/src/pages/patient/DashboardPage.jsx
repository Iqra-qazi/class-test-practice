import { ArrowRight, CalendarCheck, CalendarClock, CalendarDays } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import { useMyAppointments } from '../../hooks/useMyAppointments'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import StatCard from '../../components/ui/StatCard'

function AppointmentStatsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="h-32 animate-pulse rounded-2xl border border-clinic-line bg-white" />
      ))}
    </div>
  )
}

export default function PatientDashboardPage() {
  const { user } = useAuth()
  const { appointments: appointmentData, isLoading, error, refresh } = useMyAppointments()
  const appointments = Array.isArray(appointmentData) ? appointmentData : []
  const pending = appointments.filter((appointment) => appointment?.status === 'pending').length
  const approved = appointments.filter((appointment) => appointment?.status === 'approved').length

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-7">
        <section className="relative overflow-hidden rounded-3xl bg-clinic-navy p-6 text-white shadow-card sm:p-9">
          <div className="relative z-10 max-w-2xl">
            <p className="text-sm font-semibold text-clinic-ivory/75">Your patient workspace</p>
            <h1 className="mt-2 font-display text-3xl leading-tight sm:text-4xl">
              Welcome, {user?.name || 'there'}.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-clinic-ivory/80 sm:text-base">
              Keep your care on track. Find a doctor, request a time, and follow your appointments from one place.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/patient/doctors"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-clinic-navy transition hover:bg-clinic-ivory focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-clinic-navy"
              >
                Find a doctor <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link
                to="/patient/appointments"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/30 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                My appointments
              </Link>
            </div>
          </div>
          <div aria-hidden="true" className="absolute -right-10 -top-20 h-72 w-72 rounded-full border border-white/10" />
          <div aria-hidden="true" className="absolute -right-2 -top-12 h-56 w-56 rounded-full border border-white/10" />
        </section>

        <section aria-labelledby="appointment-summary-heading">
          <div className="mb-4">
            <h2 id="appointment-summary-heading" className="font-display text-2xl text-clinic-navy">Appointment summary</h2>
            <p className="mt-1 text-sm text-clinic-muted">A quick view of your current requests and visits.</p>
          </div>

          {isLoading ? (
            <AppointmentStatsSkeleton />
          ) : error ? (
            <div className="flex flex-col items-start gap-3 rounded-2xl border border-clinic-danger/20 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-clinic-danger" role="alert">{error}</p>
              <Button variant="secondary" onClick={refresh}>Try again</Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard label="Total appointments" value={appointments.length} icon={<CalendarDays size={20} />} tone="teal" />
              <StatCard label="Pending" value={pending} icon={<CalendarClock size={20} />} tone="amber" />
              <StatCard label="Approved" value={approved} icon={<CalendarCheck size={20} />} tone="green" />
            </div>
          )}
        </section>

        {!isLoading && !error && appointments.length === 0 && (
          <EmptyState
            title="Your appointment list is clear"
            description="When you book a visit, you can follow its status here."
            action={(
              <Link to="/patient/doctors" className="text-sm font-semibold text-clinic-teal hover:text-clinic-navy">
                Browse doctors
              </Link>
            )}
          />
        )}

      </div>
    </DashboardLayout>
  )
}
