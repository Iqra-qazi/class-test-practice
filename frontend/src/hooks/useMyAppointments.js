import { useCallback, useEffect, useState } from 'react'
import { appointmentApi } from '../api/appointmentApi'
import { getApiErrorMessage } from '../utils/apiError'

export function useMyAppointments() {
  const [appointments, setAppointments] = useState([])
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
        const data = await appointmentApi.getMyAppointments({ signal: controller.signal })
        if (!Array.isArray(data)) {
          throw new Error('The server returned an invalid appointments list.')
        }
        setAppointments(data)
      } catch (requestError) {
        if (controller.signal.aborted) return
        setError(getApiErrorMessage(requestError, 'Unable to load your appointments.'))
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }

    loadAppointments()
    return () => controller.abort()
  }, [refreshKey])

  return { appointments, isLoading, error, refresh }
}
