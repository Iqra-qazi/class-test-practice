import { useState } from 'react'
import { CalendarCheck, CalendarClock, CalendarDays, CalendarX2, Stethoscope } from 'lucide-react'
import { useAuth } from '../../context/useAuth'
import { useDoctorAppointments } from '../../hooks/useDoctorAppointments'
import DashboardLayout from '../../components/layout/DashboardLayout'
import ErrorState from '../../components/ui/ErrorState'
import StatCard from '../../components/ui/StatCard'

const trackedStatuses = ['pending', 'approved', 'rejected', 'cancelled']

function getAppointmentCounts(appointments, countsByStatus) {
  const counts = Object.fromEntries(trackedStatuses.map((status) => {
    const backendCount = countsByStatus?.[status]
    const value = Number(backendCount)
    const count = Number.isFinite(value) && value >= 0
      ? value
      : appointments.filter((appointment) => appointment?.status === status).length
    return [status, count]
  }))

  const hasBackendCounts = trackedStatuses.some((status) => (
    Number.isFinite(Number(countsByStatus?.[status]))
  ))

  return {
    ...counts,
    total: hasBackendCounts
      ? trackedStatuses.reduce((total, status) => total + counts[status], 0)
      : appointments.length,
  }
}

function ProfilePicture({ picture, name }) {
  const [imageUnavailable, setImageUnavailable] = useState(false)

  if (picture && !imageUnavailable) {
    return (
      <img
        src={picture}
        alt=""
        className="h-20 w-20 rounded-2xl object-cover"
        onError={() => setImageUnavailable(true)}
      />
    )
  }

  return (
    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-clinic-teal/10 text-clinic-teal">
      <Stethoscope size={30} strokeWidth={1.6} aria-hidden="true" />
      <span className="sr-only">{name}</span>
    </div>
  )
}

export default function DoctorDashboardPage() {
  const { user } = useAuth()
  const { appointments: appointmentData, countsByStatus, isLoading, error, refresh } = useDoctorAppointments()
  const appointments = Array.isArray(appointmentData) ? appointmentData : []
  const counts = getAppointmentCounts(appointments, countsByStatus)
  const experience = Number(user?.experience)

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-7">
        <section className="rounded-3xl border border-clinic-line bg-white p-6 shadow-card sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.15em] text-clinic-gold">Doctor profile</p>
          <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
            <ProfilePicture picture={user?.picture} name={user?.name ?? 'Doctor'} />
            <div className="min-w-0">
              <h1 className="font-display text-3xl text-clinic-navy">{user?.name ?? 'Doctor'}</h1>
              <p className="mt-1 text-clinic-teal">{user?.specialization || 'Specialization not listed'}</p>
              <p className="mt-2 break-all text-sm text-clinic-muted">{user?.email ?? 'Email not available'}</p>
              <p className="mt-1 text-sm text-clinic-muted">
                {Number.isFinite(experience) && experience >= 0
                  ? `${experience} ${experience === 1 ? 'year' : 'years'} of experience`
                  : 'Experience not listed'}
              </p>
            </div>
          </div>
        </section>

        <section aria-labelledby="doctor-statistics-heading">
          <div className="mb-4">
            <h2 id="doctor-statistics-heading" className="font-display text-2xl text-clinic-navy">Appointment overview</h2>
            <p className="mt-1 text-sm text-clinic-muted">A summary of appointments assigned to you.</p>
          </div>
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="h-32 animate-pulse rounded-2xl border border-clinic-line bg-white" />
              ))}
            </div>
          ) : error ? (
            <ErrorState
              title="Appointment summary unavailable"
              message={error}
              onRetry={refresh}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Total appointments" value={counts.total} icon={<CalendarDays size={20} />} tone="teal" />
              <StatCard label="Pending" value={counts.pending} icon={<CalendarClock size={20} />} tone="amber" />
              <StatCard label="Approved" value={counts.approved} icon={<CalendarCheck size={20} />} tone="green" />
              <StatCard label="Rejected" value={counts.rejected} icon={<CalendarX2 size={20} />} tone="red" />
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  )
}
