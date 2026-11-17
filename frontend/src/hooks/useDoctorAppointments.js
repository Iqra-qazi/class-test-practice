import { useCallback, useEffect, useState } from 'react'
import { appointmentApi } from '../api/appointmentApi'
import { getApiErrorMessage } from '../utils/apiError'

export function useDoctorAppointments() {
  const [appointments, setAppointments] = useState([])
  const [countsByStatus, setCountsByStatus] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  const refresh = useCallback(() => {
    setRefreshKey((current) => current + 1)
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    async function loadAppointments() {
      setIsLoading(true)
      setError('')
      try {
        const data = await appointmentApi.getDoctorAppointments({ signal: controller.signal })
        if (!data || !Array.isArray(data.appointments)) {
          throw new Error('The server returned an invalid doctor appointments response.')
        }
        setAppointments(data.appointments)
        setCountsByStatus(
          data.countsByStatus && typeof data.countsByStatus === 'object'
            ? data.countsByStatus
            : null,
        )
      } catch (requestError) {
        if (controller.signal.aborted) return
        setError(getApiErrorMessage(requestError, 'Unable to load appointment requests.'))
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }

    loadAppointments()
    return () => controller.abort()
  }, [refreshKey])

  return { appointments, countsByStatus, isLoading, error, refresh }
}
