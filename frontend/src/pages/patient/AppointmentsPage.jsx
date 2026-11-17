import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { appointmentApi } from '../../api/appointmentApi'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Button from '../../components/ui/Button'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import DataTable from '../../components/ui/DataTable'
import ErrorState from '../../components/ui/ErrorState'
import { Skeleton } from '../../components/ui/Loader'
import StatusBadge from '../../components/ui/StatusBadge'
import { useMyAppointments } from '../../hooks/useMyAppointments'
import { getApiErrorMessage } from '../../utils/apiError'

const filters = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'cancelled', label: 'Cancelled' },
]

function formatAppointmentDate(value) {
  if (!value) return 'Date unavailable'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Date unavailable'
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeZone: 'UTC',
  }).format(date)
}

function DoctorName({ doctor }) {
  return doctor?.name
    ? <span className="font-medium text-clinic-navy">{doctor.name}</span>
    : <span className="italic text-clinic-muted">Doctor no longer available</span>
}

export default function AppointmentsPage() {
  const { appointments: appointmentData, isLoading, error, refresh } = useMyAppointments()
  const appointments = useMemo(
    () => (Array.isArray(appointmentData) ? appointmentData : []),
    [appointmentData],
  )
  const [activeFilter, setActiveFilter] = useState('all')
  const [appointmentToCancel, setAppointmentToCancel] = useState(null)
  const [isCancelling, setIsCancelling] = useState(false)

  const visibleAppointments = useMemo(() => (
    activeFilter === 'all'
      ? appointments
      : appointments.filter((appointment) => appointment?.status === activeFilter)
  ), [activeFilter, appointments])

  async function handleCancel() {
    if (!appointmentToCancel?._id) return

    setIsCancelling(true)
    try {
      await appointmentApi.cancelAppointment(appointmentToCancel._id)
      toast.success('Appointment cancelled.')
      setAppointmentToCancel(null)
      refresh()
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError, 'Unable to cancel this appointment.'))
    } finally {
      setIsCancelling(false)
    }
  }

  const columns = [
    {
      key: 'doctor',
      label: 'Doctor',
      render: (appointment) => <DoctorName doctor={appointment?.doctor} />,
    },
    {
      key: 'specialization',
      label: 'Specialization',
      render: (appointment) => appointment?.doctor?.specialization || 'Not available',
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
    {
      key: 'actions',
      label: 'Action',
      render: (appointment) => appointment?.status === 'pending' && appointment?._id ? (
        <Button
          variant="danger"
          className="min-h-9 px-3 py-1.5 text-xs"
          onClick={() => setAppointmentToCancel(appointment)}
        >
          Cancel
        </Button>
      ) : <span className="text-sm text-clinic-muted">—</span>,
    },
  ]

  return (
    <DashboardLayout title="My Appointments">
      <div className="space-y-6">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-clinic-gold">Your care history</p>
            <h1 className="mt-1 font-display text-3xl text-clinic-navy">My appointments</h1>
            <p className="mt-2 text-sm leading-6 text-clinic-muted">Review your requests and current appointment statuses.</p>
          </div>
          {!isLoading && !error && <p className="text-sm text-clinic-muted">{appointments.length} total</p>}
        </header>

        <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Filter appointments by status">
          {filters.map((filter) => {
            const count = filter.value === 'all'
              ? appointments.length
              : appointments.filter((appointment) => appointment?.status === filter.value).length
            const selected = activeFilter === filter.value
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
                onClick={() => setActiveFilter(filter.value)}
              >
                {filter.label} <span className={selected ? 'text-white/75' : 'text-clinic-muted'}>({count})</span>
              </button>
            )
          })}
        </div>

        {isLoading ? (
          <div className="rounded-2xl border border-clinic-line bg-white p-5">
            <Skeleton rows={5} />
          </div>
        ) : error ? (
          <ErrorState
            title="Appointments could not be loaded"
            message={error}
            onRetry={refresh}
          />
        ) : appointments.length === 0 ? (
          <DataTable
            columns={columns}
            rows={[]}
            emptyTitle="No appointments yet"
            emptyDescription="After you book a visit, it will appear here."
          />
        ) : visibleAppointments.length === 0 ? (
          <DataTable
            columns={columns}
            rows={[]}
            emptyTitle={`No ${activeFilter} appointments`}
            emptyDescription="Choose another status filter to see your appointments."
          />
        ) : (
          <DataTable
            columns={columns}
            rows={visibleAppointments}
            getRowKey={(appointment, index) => appointment?._id ?? index}
          />
        )}
      </div>

      <ConfirmDialog
        open={Boolean(appointmentToCancel)}
        onClose={() => {
          if (!isCancelling) setAppointmentToCancel(null)
        }}
        onConfirm={handleCancel}
        title="Cancel this appointment?"
        description="This request will be marked as cancelled. You can book this time again afterward."
        confirmLabel="Cancel appointment"
        loading={isCancelling}
      />
    </DashboardLayout>
  )
}
