import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { appointmentApi } from '../../api/appointmentApi'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Button from '../../components/ui/Button'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import DataTable from '../../components/ui/DataTable'
import EmptyState from '../../components/ui/EmptyState'
import ErrorState from '../../components/ui/ErrorState'
import Input from '../../components/ui/Input'
import { Skeleton } from '../../components/ui/Loader'
import StatusBadge from '../../components/ui/StatusBadge'
import { useDoctorAppointments } from '../../hooks/useDoctorAppointments'
import { getApiErrorMessage } from '../../utils/apiError'

const filters = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'cancelled', label: 'Cancelled' },
]

function getAppointmentDateValue(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? Number.POSITIVE_INFINITY : date.getTime()
}

function formatAppointmentDate(value) {
  const date = new Date(value)
  if (!value || Number.isNaN(date.getTime())) return 'Date unavailable'
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeZone: 'UTC',
  }).format(date)
}

function PatientDetails({ patient }) {
  if (!patient) {
    return <span className="italic text-clinic-muted">Patient details unavailable</span>
  }

  return (
    <span className="flex min-w-0 flex-col">
      <span className="font-medium text-clinic-navy">{patient.name || 'Patient name unavailable'}</span>
      <span className="break-all text-xs text-clinic-muted">{patient.email || 'Email unavailable'}</span>
    </span>
  )
}

export default function RequestsPage() {
  const {
    appointments: appointmentData,
    isLoading,
    error,
    refresh,
  } = useDoctorAppointments()
  const appointments = useMemo(
    () => (Array.isArray(appointmentData) ? appointmentData : []),
    [appointmentData],
  )
  const [activeFilter, setActiveFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [appointmentAction, setAppointmentAction] = useState(null)
  const [updatingAppointmentId, setUpdatingAppointmentId] = useState('')
  const [actionError, setActionError] = useState('')

  const filteredAppointments = useMemo(() => {
    const query = search.trim().toLocaleLowerCase()
    return [...appointments]
      .sort((first, second) => {
        const pendingOrder = Number(second?.status === 'pending') - Number(first?.status === 'pending')
        if (pendingOrder !== 0) return pendingOrder

        const dateOrder = getAppointmentDateValue(first?.appointmentDate)
          - getAppointmentDateValue(second?.appointmentDate)
        if (dateOrder !== 0) return dateOrder

        return String(first?.appointmentTime ?? '').localeCompare(String(second?.appointmentTime ?? ''))
      })
      .filter((appointment) => activeFilter === 'all' || appointment?.status === activeFilter)
      .filter((appointment) => !query || (
        typeof appointment?.patient?.name === 'string'
        && appointment.patient.name.toLocaleLowerCase().includes(query)
      ))
  }, [activeFilter, appointments, search])

  async function handleStatusUpdate() {
    const { appointment, status } = appointmentAction ?? {}
    if (!appointment?._id || !['approved', 'rejected'].includes(status)) return

    setUpdatingAppointmentId(appointment._id)
    setActionError('')
    try {
      await appointmentApi.updateAppointmentStatus(appointment._id, status)
      toast.success(`Appointment ${status}.`)
      setAppointmentAction(null)
      refresh()
    } catch (requestError) {
      const message = getApiErrorMessage(requestError, 'Unable to update this appointment.')
      setActionError(message)
      toast.error(message)
    } finally {
      setUpdatingAppointmentId('')
    }
  }

  const columns = [
    {
      key: 'patient',
      label: 'Patient',
      render: (appointment) => <PatientDetails patient={appointment?.patient} />,
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
      label: 'Actions',
      render: (appointment) => appointment?.status === 'pending' && appointment?._id ? (
        <div className="flex flex-wrap gap-2">
          <Button
            className="min-h-9 px-3 py-1.5 text-xs"
            disabled={Boolean(updatingAppointmentId)}
            onClick={() => {
              setActionError('')
              setAppointmentAction({ appointment, status: 'approved' })
            }}
          >
            Approve
          </Button>
          <Button
            variant="danger"
            className="min-h-9 px-3 py-1.5 text-xs"
            disabled={Boolean(updatingAppointmentId)}
            onClick={() => {
              setActionError('')
              setAppointmentAction({ appointment, status: 'rejected' })
            }}
          >
            Reject
          </Button>
        </div>
      ) : <span className="text-sm text-clinic-muted">—</span>,
    },
  ]

  const selectedPatientName = appointmentAction?.appointment?.patient?.name
    || 'this patient'
  const nextStatusLabel = appointmentAction?.status === 'approved' ? 'Approve' : 'Reject'

  return (
    <DashboardLayout title="Appointment Requests">
      <div className="space-y-6">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-clinic-gold">Your schedule</p>
            <h1 className="mt-1 font-display text-3xl text-clinic-navy">Appointment requests</h1>
            <p className="mt-2 text-sm leading-6 text-clinic-muted">Review patient requests and update pending appointments.</p>
          </div>
          {!isLoading && !error && <p className="text-sm text-clinic-muted">{appointments.length} total</p>}
        </header>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
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
          <div className="w-full lg:max-w-sm">
            <Input
              id="patient-search"
              label="Search by patient name"
              type="search"
              placeholder="Enter a patient name"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        {actionError && (
          <div className="rounded-xl border border-clinic-danger/20 bg-red-50 px-4 py-3 text-sm text-clinic-danger" role="alert">
            {actionError}
          </div>
        )}

        {isLoading ? (
          <div className="rounded-2xl border border-clinic-line bg-white p-5">
            <Skeleton rows={5} />
          </div>
        ) : error ? (
          <ErrorState
            title="Appointment requests could not be loaded"
            message={error}
            onRetry={refresh}
          />
        ) : appointments.length === 0 ? (
          <EmptyState
            title="No appointment requests yet"
            description="New requests assigned to you will appear here."
          />
        ) : filteredAppointments.length === 0 ? (
          <EmptyState
            title="No matching requests"
            description="Try a different patient name or status filter."
          />
        ) : (
          <DataTable
            columns={columns}
            rows={filteredAppointments}
            getRowKey={(appointment, index) => appointment?._id ?? index}
          />
        )}
      </div>

      <ConfirmDialog
        open={Boolean(appointmentAction)}
        onClose={() => {
          if (!updatingAppointmentId) setAppointmentAction(null)
        }}
        onConfirm={handleStatusUpdate}
        title={`${nextStatusLabel} appointment?`}
        description={`Are you sure you want to ${nextStatusLabel.toLowerCase()} ${selectedPatientName}'s appointment?`}
        confirmLabel={nextStatusLabel}
        loading={Boolean(updatingAppointmentId)}
        variant={appointmentAction?.status === 'approved' ? 'primary' : 'danger'}
      />
    </DashboardLayout>
  )
}
