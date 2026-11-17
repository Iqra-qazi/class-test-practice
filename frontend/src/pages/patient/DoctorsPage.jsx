import { useEffect, useState } from 'react'
import { ArrowRight, Search, Stethoscope } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { doctorApi } from '../../api/doctorApi'
import DashboardLayout from '../../components/layout/DashboardLayout'
import EmptyState from '../../components/ui/EmptyState'
import ErrorState from '../../components/ui/ErrorState'
import Input from '../../components/ui/Input'
import { getApiErrorMessage } from '../../utils/apiError'

function DoctorCard({ doctor, onBook }) {
  const [imageUnavailable, setImageUnavailable] = useState(false)
  const name = typeof doctor?.name === 'string' && doctor.name.trim() ? doctor.name : 'Doctor'
  const picture = typeof doctor?.picture === 'string' && doctor.picture.trim() ? doctor.picture : ''
  const experience = Number(doctor?.experience)

  return (
    <article className="flex h-full flex-col rounded-2xl border border-clinic-line bg-white p-5 shadow-card transition duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start gap-4">
        {picture && !imageUnavailable ? (
          <img
            src={picture}
            alt=""
            className="h-16 w-16 shrink-0 rounded-2xl object-cover"
            onError={() => setImageUnavailable(true)}
          />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-clinic-teal/10 text-clinic-teal">
            <Stethoscope size={25} strokeWidth={1.7} aria-hidden="true" />
          </div>
        )}
        <div className="min-w-0 pt-1">
          <h2 className="truncate font-display text-xl text-clinic-navy">{name}</h2>
          <p className="mt-1 text-sm font-medium text-clinic-teal">
            {doctor?.specialization || 'Specialization not listed'}
          </p>
        </div>
      </div>
      <p className="mt-5 text-sm text-clinic-muted">
        {Number.isFinite(experience) && experience >= 0
          ? `${experience} ${experience === 1 ? 'year' : 'years'} of experience`
          : 'Experience not listed'}
      </p>
      <button
        type="button"
        disabled={!doctor?._id && !doctor?.id}
        onClick={() => onBook(doctor?._id ?? doctor?.id)}
        className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-clinic-navy px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-clinic-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clinic-teal focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Book appointment <ArrowRight size={16} aria-hidden="true" />
      </button>
    </article>
  )
}

function DoctorCardSkeleton() {
  return (
    <div className="h-56 animate-pulse rounded-2xl border border-clinic-line bg-white p-5">
      <div className="flex gap-4">
        <div className="h-16 w-16 rounded-2xl bg-clinic-line" />
        <div className="flex-1 space-y-3 pt-2">
          <div className="h-4 w-3/4 rounded bg-clinic-line" />
          <div className="h-3 w-1/2 rounded bg-clinic-line" />
        </div>
      </div>
      <div className="mt-6 h-3 w-2/3 rounded bg-clinic-line" />
      <div className="mt-8 h-11 rounded-xl bg-clinic-line" />
    </div>
  )
}

export default function DoctorsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [doctors, setDoctors] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [requestKey, setRequestKey] = useState(0)
  const doctorItems = Array.isArray(doctors) ? doctors : []

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 400)
    return () => window.clearTimeout(timer)
  }, [search])

  useEffect(() => {
    const controller = new AbortController()

    async function loadDoctors() {
      setIsLoading(true)
      setError('')
      try {
        const data = await doctorApi.listDoctors(debouncedSearch, { signal: controller.signal })
        if (!Array.isArray(data)) {
          throw new Error('The server returned an invalid doctors list.')
        }
        setDoctors(data)
      } catch (requestError) {
        if (controller.signal.aborted) return
        setError(getApiErrorMessage(requestError, 'Unable to load doctors right now.'))
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }

    loadDoctors()
    return () => controller.abort()
  }, [debouncedSearch, requestKey])

  return (
    <DashboardLayout title="Find Doctors">
      <div className="space-y-6">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-clinic-gold">Your care team</p>
            <h1 className="mt-1 font-display text-3xl text-clinic-navy">Find the right doctor</h1>
            <p className="mt-2 text-sm leading-6 text-clinic-muted">Browse active doctors by name or area of care.</p>
          </div>
          {!isLoading && !error && (
            <p className="text-sm text-clinic-muted">{doctorItems.length} {doctorItems.length === 1 ? 'doctor' : 'doctors'}</p>
          )}
        </header>

        <div className="relative max-w-xl">
          <Search size={18} className="pointer-events-none absolute left-3.5 top-3.5 text-clinic-muted" aria-hidden="true" />
          <Input
            id="doctor-search"
            type="search"
            label="Search doctors"
            className="pl-10"
            placeholder="Name or specialization"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => <DoctorCardSkeleton key={index} />)}
          </div>
        ) : error ? (
          <ErrorState
            title="Doctors could not be loaded"
            message={error}
            onRetry={() => setRequestKey((current) => current + 1)}
          />
        ) : doctorItems.length === 0 ? (
          <EmptyState
            title="No doctors found"
            description={search.trim()
              ? `No active doctors match “${search.trim()}”. Try another name or specialization.`
              : 'There are no active doctors available at the moment.'}
            icon={<Search size={20} aria-hidden="true" />}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {doctorItems.map((doctor, index) => (
              <DoctorCard
                key={doctor?._id ?? doctor?.id ?? `doctor-${index}`}
                doctor={doctor}
                onBook={(id) => navigate(`/patient/book/${encodeURIComponent(id)}`)}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
