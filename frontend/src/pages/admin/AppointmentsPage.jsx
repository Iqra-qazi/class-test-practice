import { useEffect, useMemo, useState } from 'react'
import { adminApi } from '../../api/adminApi'
import DashboardLayout from '../../components/layout/DashboardLayout'
import DataTable from '../../components/ui/DataTable'
import EmptyState from '../../components/ui/EmptyState'
import ErrorState from '../../components/ui/ErrorState'
import Input from '../../components/ui/Input'
import { Skeleton } from '../../components/ui/Loader'
import StatusBadge from '../../components/ui/StatusBadge'
import { getApiErrorMessage } from '../../utils/apiError'

const statusFilters = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'cancelled', label: 'Cancelled' },
]

function formatAppointmentDate(value) {
  const date = new Date(value)
  if (!value || Number.isNaN(date.getTime())) return 'Date unavailable'
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeZone: 'UTC',
  }).format(date)
}

function PersonCell({ person, unavailableLabel, extra }) {
  if (!person) {
    return <span className="italic text-clinic-muted">{unavailableLabel}</span>
  }

  return (
    <span className="flex min-w-0 flex-col">
      <span className="font-medium text-clinic-navy">{person.name || unavailableLabel}</span>
      {extra && <span className="text-xs text-clinic-muted">{extra}</span>}
    </span>
  )
}

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState([])
  const [activeStatus, setActiveStatus] = useState('all')
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    async function loadAppointments() {
      setIsLoading(true)
      setError('')
      try {
        const data = await adminApi.listAppointments({ signal: controller.signal })
        if (!Array.isArray(data)) {
          throw new Error('The server returned an invalid appointments list.')
        }
        setAppointments(data)
      } catch (requestError) {
        if (controller.signal.aborted) return
        setError(getApiErrorMessage(requestError, 'Unable to load appointments.'))
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }

    loadAppointments()
    return () => controller.abort()
  }, [retryKey])

  const visibleAppointments = useMemo(() => {
    const query = search.trim().toLocaleLowerCase()
    return appointments
      .filter((appointment) => activeStatus === 'all' || appointment?.status === activeStatus)
      .filter((appointment) => {
        if (!query) return true
        const patientName = typeof appointment?.patient?.name === 'string'
          ? appointment.patient.name.toLocaleLowerCase()
          : ''
        const doctorName = typeof appointment?.doctor?.name === 'string'
          ? appointment.doctor.name.toLocaleLowerCase()
          : ''
        return patientName.includes(query) || doctorName.includes(query)
      })
  }, [activeStatus, appointments, search])

  const columns = [
    {
      key: 'patient',
      label: 'Patient',
      render: (appointment) => (
        <PersonCell
          person={appointment?.patient}
          unavailableLabel="Patient unavailable"
          extra={appointment?.patient?.email || 'Email unavailable'}
        />
      ),
    },
    {
      key: 'doctor',
      label: 'Doctor',
      render: (appointment) => (
        <PersonCell
          person={appointment?.doctor}
          unavailableLabel="Doctor unavailable"
          extra={appointment?.doctor?.specialization || 'Specialization unavailable'}
        />
      ),
    },
    {
      key: 'appointmentDate',
      label: 'Date',
      render: (appointment) => formatAppointmentDate(appointment?.appointmentDate),
    },
    {
      key: 'appointmentTime',
      label: 'Time',
      render: (appointment) => appointment?.appointmentTime || 'Time unavailable',
    },
    {
      key: 'reason',
      label: 'Reason',
      render: (appointment) => (
        <span className="line-clamp-2 max-w-xs" title={appointment?.reason ?? ''}>
          {appointment?.reason || '—'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (appointment) => <StatusBadge status={appointment?.status} />,
    },
  ]

  const safeAppointments = Array.isArray(appointments) ? appointments : []

  return (
    <DashboardLayout title="All Appointments">
      <div className="space-y-6">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-clinic-gold">Clinic schedule</p>
            <h1 className="mt-1 font-display text-3xl text-clinic-navy">All appointments</h1>
            {!isLoading && !error && <p className="mt-2 text-sm text-clinic-muted">{safeAppointments.length} total</p>}
          </div>
          <div className="w-full sm:max-w-sm">
            <Input
              id="appointment-search"
              type="search"
              label="Search patient or doctor"
              placeholder="Enter a name"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </header>

        <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Filter appointments by status">
          {statusFilters.map((filter) => {
            const count = filter.value === 'all'
              ? safeAppointments.length
              : safeAppointments.filter((appointment) => appointment?.status === filter.value).length
            const selected = activeStatus === filter.value
            return (
              <button
                key={filter.value}
                type="button"
                role="tab"
                aria-selected={selected}
                className={`shrink-0 rounded-full border px-3.5 py-2 text-sm font-medium transition ${
                  selected
                    ? 'border-clinic-navy bg-clinic-navy text-white'
                    : 'border-clinic-line bg-white text-clinic-muted hover:border-clinic-teal hover:text-clinic-teal'
                }`}
                onClick={() => setActiveStatus(filter.value)}
              >
                {filter.label} <span className={selected ? 'text-white/75' : 'text-clinic-muted'}>({count})</span>
              </button>
            )
          })}
        </div>

        {isLoading ? (
          <div className="rounded-2xl border border-clinic-line bg-white p-5"><Skeleton rows={5} /></div>
        ) : error ? (
          <ErrorState
            title="Appointments could not be loaded"
            message={error}
            onRetry={() => setRetryKey((current) => current + 1)}
          />
        ) : visibleAppointments.length === 0 ? (
          <EmptyState
            title={safeAppointments.length === 0 ? 'No appointments yet' : 'No matching appointments'}
            description={safeAppointments.length === 0
              ? 'Appointments from across the clinic will appear here.'
              : 'Try a different name or status filter.'}
          />
        ) : (
          <DataTable
            columns={columns}
            rows={visibleAppointments}
            getRowKey={(appointment, index) => appointment?._id ?? index}
          />
        )}
      </div>
    </DashboardLayout>
  )
}
