import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { adminApi } from '../../api/adminApi'
import { useAuth } from '../../context/useAuth'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Button from '../../components/ui/Button'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import DataTable from '../../components/ui/DataTable'
import EmptyState from '../../components/ui/EmptyState'
import ErrorState from '../../components/ui/ErrorState'
import Input from '../../components/ui/Input'
import { Skeleton } from '../../components/ui/Loader'
import Modal from '../../components/ui/Modal'
import { getApiErrorMessage } from '../../utils/apiError'

const roleFilters = [
  { value: 'all', label: 'All' },
  { value: 'admin', label: 'Admin' },
  { value: 'doctor', label: 'Doctor' },
  { value: 'patient', label: 'Patient' },
]

const emptyDoctorForm = {
  name: '',
  email: '',
  password: '',
  specialization: '',
  experience: '0',
}

const roleStyles = {
  admin: 'bg-clinic-navy/10 text-clinic-navy',
  doctor: 'bg-clinic-teal/10 text-clinic-teal',
  patient: 'bg-clinic-gold/15 text-clinic-gold',
}

function RoleBadge({ role }) {
  const label = typeof role === 'string' ? `${role[0]?.toUpperCase() ?? ''}${role.slice(1)}` : 'Unknown'
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${roleStyles[role] ?? 'bg-gray-100 text-gray-700'}`}>
      {label}
    </span>
  )
}

function AccountStatus({ active }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${active ? 'text-clinic-success' : 'text-clinic-neutral'}`}>
      <span className={`h-2 w-2 rounded-full ${active ? 'bg-clinic-success' : 'bg-clinic-neutral'}`} aria-hidden="true" />
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}

export default function UsersPage() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [activeRole, setActiveRole] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [updatingUserId, setUpdatingUserId] = useState('')
  const [userToDelete, setUserToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [operationError, setOperationError] = useState('')
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false)
  const [doctorForm, setDoctorForm] = useState(emptyDoctorForm)
  const [doctorErrors, setDoctorErrors] = useState({})
  const [doctorFormError, setDoctorFormError] = useState('')
  const [isCreatingDoctor, setIsCreatingDoctor] = useState(false)

  const refresh = () => setRefreshKey((current) => current + 1)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => window.clearTimeout(timer)
  }, [search])

  useEffect(() => {
    const controller = new AbortController()

    async function loadUsers() {
      setIsLoading(true)
      setLoadError('')
      try {
        const data = await adminApi.listUsers(debouncedSearch, { signal: controller.signal })
        if (!Array.isArray(data)) {
          throw new Error('The server returned an invalid user list.')
        }
        setUsers(data)
      } catch (requestError) {
        if (controller.signal.aborted) return
        setLoadError(getApiErrorMessage(requestError, 'Unable to load users.'))
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }

    loadUsers()
    return () => controller.abort()
  }, [debouncedSearch, refreshKey])

  const visibleUsers = useMemo(() => (
    activeRole === 'all'
      ? users
      : users.filter((account) => account?.role === activeRole)
  ), [activeRole, users])

  async function handleToggleStatus(account) {
    const id = account?._id
    if (!id || String(id) === String(currentUser?.id)) return

    const isActive = account.isActive === true
    setUpdatingUserId(String(id))
    setOperationError('')
    try {
      await adminApi.updateUserStatus(id, !isActive)
      toast.success(isActive ? 'User deactivated.' : 'User activated.')
      refresh()
    } catch (requestError) {
      const message = getApiErrorMessage(requestError, 'Unable to update this account.')
      setOperationError(message)
      toast.error(message)
    } finally {
      setUpdatingUserId('')
    }
  }

  async function handleDeleteUser() {
    const id = userToDelete?._id
    if (!id || String(id) === String(currentUser?.id)) return

    setIsDeleting(true)
    setOperationError('')
    try {
      const result = await adminApi.deleteUser(id)
      toast.success(result?.message || 'User deleted.')
      setUserToDelete(null)
      refresh()
    } catch (requestError) {
      const message = getApiErrorMessage(requestError, 'Unable to delete this account.')
      setOperationError(message)
      toast.error(message)
    } finally {
      setIsDeleting(false)
    }
  }

  function validateDoctorForm() {
    const name = String(doctorForm?.name ?? '').trim()
    const email = String(doctorForm?.email ?? '').trim()
    const password = String(doctorForm?.password ?? '')
    const specialization = String(doctorForm?.specialization ?? '').trim()
    const experienceValue = String(doctorForm?.experience ?? '')
    const experience = Number(experienceValue)
    const errors = {}

    if (name.length < 2) errors.name = 'Name must be at least 2 characters.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email address.'
    if (password.length < 8) errors.password = 'Password must be at least 8 characters.'
    if (!specialization) errors.specialization = 'Enter a specialization.'
    if (!experienceValue || !Number.isInteger(experience) || experience < 0 || experience > 80) {
      errors.experience = 'Enter a whole number from 0 to 80.'
    }
    return errors
  }

  function updateDoctorField(event) {
    const { name, value } = event.target
    setDoctorForm((form) => ({ ...(form ?? {}), [name]: value }))
    setDoctorErrors((errors) => ({ ...(errors ?? {}), [name]: undefined }))
    setDoctorFormError('')
  }

  function closeDoctorModal() {
    if (isCreatingDoctor) return
    setIsDoctorModalOpen(false)
    setDoctorErrors({})
    setDoctorFormError('')
  }

  async function handleCreateDoctor(event) {
    event.preventDefault()
    const errors = validateDoctorForm()
    setDoctorErrors(errors)
    if (Object.keys(errors).length > 0) return

    setIsCreatingDoctor(true)
    setDoctorFormError('')
    try {
      await adminApi.createDoctor({
        name: String(doctorForm?.name ?? '').trim(),
        email: String(doctorForm?.email ?? '').trim(),
        password: String(doctorForm?.password ?? ''),
        specialization: String(doctorForm?.specialization ?? '').trim(),
        experience: Number(doctorForm?.experience),
      })
      toast.success('Doctor account created.')
      setIsDoctorModalOpen(false)
      setDoctorForm(emptyDoctorForm)
      setDoctorErrors({})
      refresh()
    } catch (requestError) {
      const message = getApiErrorMessage(requestError, 'Unable to create the doctor account.')
      setDoctorFormError(message)
      toast.error(message)
      if (requestError?.response?.status === 409) {
        setDoctorErrors((current) => ({ ...(current ?? {}), email: message }))
      }
    } finally {
      setIsCreatingDoctor(false)
    }
  }

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (account) => account?.name || 'Name unavailable',
    },
    {
      key: 'email',
      label: 'Email',
      render: (account) => account?.email || 'Email unavailable',
    },
    {
      key: 'role',
      label: 'Role',
      render: (account) => <RoleBadge role={account?.role} />,
    },
    {
      key: 'professionalDetails',
      label: 'Specialization / Experience',
      render: (account) => account?.role === 'doctor'
        ? `${account.specialization || 'Not listed'} · ${Number.isFinite(Number(account.experience)) ? `${account.experience} ${Number(account.experience) === 1 ? 'year' : 'years'}` : 'Experience not listed'}`
        : '—',
    },
    {
      key: 'status',
      label: 'Status',
      render: (account) => <AccountStatus active={account?.isActive === true} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (account) => {
        const id = String(account?._id ?? '')
        const isSelf = Boolean(id && id === String(currentUser?.id ?? ''))
        const isUpdating = updatingUserId === id
        return (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              className="min-h-9 px-3 py-1.5 text-xs"
              disabled={isUpdating || (isSelf && account?.isActive === true)}
              title={isSelf ? 'You cannot deactivate your own account.' : undefined}
              onClick={() => handleToggleStatus(account)}
            >
              {isUpdating ? 'Saving…' : account?.isActive === true ? 'Deactivate' : 'Activate'}
            </Button>
            <Button
              variant="danger"
              className="min-h-9 px-3 py-1.5 text-xs"
              disabled={isSelf || isUpdating || isDeleting}
              title={isSelf ? 'You cannot delete your own account.' : undefined}
              onClick={() => {
                setOperationError('')
                setUserToDelete(account)
              }}
            >
              Delete
            </Button>
          </div>
        )
      },
    },
  ]

  return (
    <DashboardLayout title="Manage Users">
      <div className="space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-clinic-gold">Clinic accounts</p>
            <h1 className="mt-1 font-display text-3xl text-clinic-navy">Manage users</h1>
            {!isLoading && !loadError && <p className="mt-2 text-sm text-clinic-muted">{users.length} accounts</p>}
          </div>
          <Button
            onClick={() => {
              setDoctorForm(emptyDoctorForm)
              setDoctorErrors({})
              setDoctorFormError('')
              setIsDoctorModalOpen(true)
            }}
          >
            Add Doctor
          </Button>
        </header>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Filter users by role">
            {roleFilters.map((filter) => {
              const count = filter.value === 'all'
                ? users.length
                : users.filter((account) => account?.role === filter.value).length
              const selected = activeRole === filter.value
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
                  onClick={() => setActiveRole(filter.value)}
                >
                  {filter.label} <span className={selected ? 'text-white/75' : 'text-clinic-muted'}>({count})</span>
                </button>
              )
            })}
          </div>
          <div className="w-full lg:max-w-sm">
            <Input
              id="user-search"
              type="search"
              label="Search users"
              placeholder="Name or email"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        {operationError && (
          <div className="rounded-xl border border-clinic-danger/20 bg-red-50 px-4 py-3 text-sm text-clinic-danger" role="alert">
            {operationError}
          </div>
        )}

        {isLoading ? (
          <div className="rounded-2xl border border-clinic-line bg-white p-5"><Skeleton rows={5} /></div>
        ) : loadError ? (
          <ErrorState title="Users could not be loaded" message={loadError} onRetry={refresh} />
        ) : visibleUsers.length === 0 ? (
          <EmptyState
            title={search.trim() || activeRole !== 'all' ? 'No matching users' : 'No users found'}
            description={search.trim()
              ? 'Try another name or email address.'
              : 'No accounts match this role filter.'}
          />
        ) : (
          <DataTable
            columns={columns}
            rows={visibleUsers}
            getRowKey={(account, index) => account?._id ?? index}
          />
        )}
      </div>

      <Modal
        open={isDoctorModalOpen}
        onClose={closeDoctorModal}
        title="Add a doctor"
        description="Create a doctor account for the clinic."
      >
        <form className="space-y-4" onSubmit={handleCreateDoctor} noValidate>
          <Input
            id="doctor-name"
            name="name"
            label="Full name"
            autoComplete="name"
            value={doctorForm.name}
            onChange={updateDoctorField}
            error={doctorErrors.name}
            required
          />
          <Input
            id="doctor-email"
            name="email"
            label="Email address"
            type="email"
            autoComplete="email"
            value={doctorForm.email}
            onChange={updateDoctorField}
            error={doctorErrors.email}
            required
          />
          <Input
            id="doctor-password"
            name="password"
            label="Temporary password"
            type="password"
            autoComplete="new-password"
            value={doctorForm.password}
            onChange={updateDoctorField}
            error={doctorErrors.password}
            hint="At least 8 characters."
            required
          />
          <Input
            id="doctor-specialization"
            name="specialization"
            label="Specialization"
            value={doctorForm.specialization}
            onChange={updateDoctorField}
            error={doctorErrors.specialization}
            required
          />
          <Input
            id="doctor-experience"
            name="experience"
            label="Years of experience"
            type="number"
            min="0"
            max="80"
            step="1"
            value={doctorForm.experience}
            onChange={updateDoctorField}
            error={doctorErrors.experience}
            required
          />
          {doctorFormError && (
            <p className="rounded-xl border border-clinic-danger/20 bg-red-50 px-4 py-3 text-sm text-clinic-danger" role="alert">
              {doctorFormError}
            </p>
          )}
          <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={closeDoctorModal} disabled={isCreatingDoctor}>
              Cancel
            </Button>
            <Button type="submit" loading={isCreatingDoctor}>Create doctor</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(userToDelete)}
        onClose={() => {
          if (!isDeleting) setUserToDelete(null)
        }}
        onConfirm={handleDeleteUser}
        title="Delete this account?"
        description={`Delete ${userToDelete?.name ?? 'this user'}? Associated appointments will also be deleted.`}
        confirmLabel="Delete account"
        loading={isDeleting}
      />
    </DashboardLayout>
  )
}
