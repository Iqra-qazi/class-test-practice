import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { appointmentApi } from '../../api/appointmentApi'
import { doctorApi } from '../../api/doctorApi'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Button from '../../components/ui/Button'
import ErrorState from '../../components/ui/ErrorState'
import Input from '../../components/ui/Input'
import { Skeleton } from '../../components/ui/Loader'
import Select from '../../components/ui/Select'
import { getApiErrorMessage } from '../../utils/apiError'

function getLocalDateValue(date = new Date()) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return localDate.toISOString().slice(0, 10)
}

function formatTimeLabel(time) {
  const [hours, minutes] = time.split(':').map(Number)
  const date = new Date(2000, 0, 1, hours, minutes)
  return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(date)
}

function getTimeSlots() {
  const slots = []
  for (let minutes = 9 * 60; minutes <= 17 * 60; minutes += 30) {
    const hours = String(Math.floor(minutes / 60)).padStart(2, '0')
    const minute = String(minutes % 60).padStart(2, '0')
    const value = `${hours}:${minute}`
    slots.push({ value, label: formatTimeLabel(value) })
  }
  return slots
}

const timeSlots = getTimeSlots()

export default function BookAppointmentPage() {
  const { doctorId = '' } = useParams()
  const navigate = useNavigate()
  const today = useMemo(() => getLocalDateValue(), [])
  const [doctor, setDoctor] = useState(null)
  const [isDoctorLoading, setIsDoctorLoading] = useState(true)
  const [doctorError, setDoctorError] = useState('')
  const [retryKey, setRetryKey] = useState(0)
  const [values, setValues] = useState({ appointmentDate: '', appointmentTime: '', reason: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    async function loadDoctor() {
      setIsDoctorLoading(true)
      setDoctorError('')
      setDoctor(null)
      try {
        const data = await doctorApi.getDoctor(doctorId, { signal: controller.signal })
        if (!data || typeof data !== 'object') {
          throw new Error('The server returned invalid doctor details.')
        }
        setDoctor(data)
      } catch (requestError) {
        if (controller.signal.aborted) return
        setDoctorError(getApiErrorMessage(requestError, 'Unable to load this doctor.'))
      } finally {
        if (!controller.signal.aborted) setIsDoctorLoading(false)
      }
    }

    loadDoctor()
    return () => controller.abort()
  }, [doctorId, retryKey])

  function validate() {
    const date = String(values?.appointmentDate ?? '')
    const time = String(values?.appointmentTime ?? '')
    const reason = String(values?.reason ?? '').trim()
    const nextErrors = {}

    if (!date) {
      nextErrors.appointmentDate = 'Choose an appointment date.'
    } else if (date < today) {
      nextErrors.appointmentDate = 'Appointment date cannot be in the past.'
    }
    if (!time) {
      nextErrors.appointmentTime = 'Choose an appointment time.'
    }
    if (!reason) {
      nextErrors.reason = 'Enter a reason for your visit.'
    } else if (reason.length > 1000) {
      nextErrors.reason = 'Reason must be 1000 characters or fewer.'
    }
    return nextErrors
  }

  function updateField(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...(current ?? {}), [name]: value }))
    setErrors((current) => ({ ...(current ?? {}), [name]: undefined }))
    setFormError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0 || !doctor) return

    setIsSubmitting(true)
    setFormError('')
    try {
      await appointmentApi.bookAppointment({
        doctor: doctorId,
        appointmentDate: values.appointmentDate,
        appointmentTime: values.appointmentTime,
        reason: values.reason.trim(),
      })
      toast.success('Appointment request sent.')
      navigate('/patient/appointments', { replace: true })
    } catch (requestError) {
      setFormError(getApiErrorMessage(requestError, 'Unable to book this appointment. Please try again.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout title="Book an Appointment">
      <div className="mx-auto max-w-3xl space-y-6">
        <header>
          <p className="text-sm font-semibold uppercase tracking-[0.15em] text-clinic-gold">Request a visit</p>
          <h1 className="mt-1 font-display text-3xl text-clinic-navy">Book an appointment</h1>
          <p className="mt-2 text-sm leading-6 text-clinic-muted">Choose a suitable date and time, then tell the doctor what you need help with.</p>
        </header>

        {isDoctorLoading ? (
          <div className="rounded-2xl border border-clinic-line bg-white p-5">
            <Skeleton rows={2} />
          </div>
        ) : doctorError ? (
          <ErrorState
            title="Doctor details unavailable"
            message={doctorError}
            onRetry={() => setRetryKey((current) => current + 1)}
          />
        ) : (
          <>
            <section className="flex items-center gap-4 rounded-2xl border border-clinic-line bg-white p-5 shadow-card">
              {doctor.picture ? (
                <img src={doctor.picture} alt="" className="h-14 w-14 rounded-2xl object-cover" />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-clinic-teal/10 font-display text-xl text-clinic-teal">
                  {(doctor.name ?? 'D').slice(0, 1)}
                </div>
              )}
              <div className="min-w-0">
                <h2 className="truncate font-display text-xl text-clinic-navy">{doctor.name ?? 'Doctor'}</h2>
                <p className="mt-1 text-sm text-clinic-teal">{doctor.specialization || 'Specialization not listed'}</p>
                <p className="mt-1 text-xs text-clinic-muted">
                  {Number.isFinite(Number(doctor.experience))
                    ? `${doctor.experience} ${Number(doctor.experience) === 1 ? 'year' : 'years'} of experience`
                    : 'Experience not listed'}
                </p>
              </div>
            </section>

            <form className="space-y-5 rounded-2xl border border-clinic-line bg-white p-5 shadow-card sm:p-7" onSubmit={handleSubmit} noValidate>
              <div className="grid gap-5 sm:grid-cols-2">
                <Input
                  id="appointmentDate"
                  name="appointmentDate"
                  label="Appointment date"
                  type="date"
                  min={today}
                  value={values.appointmentDate}
                  onChange={updateField}
                  error={errors.appointmentDate}
                  required
                />
                <Select
                  id="appointmentTime"
                  name="appointmentTime"
                  label="Appointment time"
                  value={values.appointmentTime}
                  onChange={updateField}
                  placeholder="Choose a time"
                  options={timeSlots}
                  error={errors.appointmentTime}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="reason" className="block text-sm font-medium text-clinic-ink">Reason for visit</label>
                <textarea
                  id="reason"
                  name="reason"
                  rows={5}
                  maxLength={1000}
                  value={values.reason}
                  onChange={updateField}
                  aria-invalid={Boolean(errors.reason)}
                  aria-describedby={errors.reason ? 'reason-error' : 'reason-hint'}
                  placeholder="Briefly describe what you would like to discuss."
                  className={`w-full resize-y rounded-xl border bg-white px-3.5 py-3 text-sm text-clinic-ink outline-none transition placeholder:text-clinic-muted/70 focus:border-clinic-teal focus:ring-2 focus:ring-clinic-teal/15 ${errors.reason ? 'border-clinic-danger' : 'border-clinic-line'}`}
                  required
                />
                {errors.reason ? (
                  <p id="reason-error" className="text-sm text-clinic-danger" role="alert">{errors.reason}</p>
                ) : (
                  <p id="reason-hint" className="text-xs text-clinic-muted">Up to 1000 characters.</p>
                )}
              </div>

              {formError && (
                <div className="rounded-xl border border-clinic-danger/20 bg-red-50 px-4 py-3 text-sm text-clinic-danger" role="alert">
                  {formError}
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button variant="secondary" onClick={() => navigate('/patient/doctors')} disabled={isSubmitting}>
                  Back to doctors
                </Button>
                <Button type="submit" loading={isSubmitting} disabled={isDoctorLoading || Boolean(doctorError) || !doctor}>
                  Send appointment request
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
