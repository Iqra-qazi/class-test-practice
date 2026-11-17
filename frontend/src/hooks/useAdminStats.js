import { useEffect, useState } from 'react'
import { adminApi } from '../api/adminApi'
import { getApiErrorMessage } from '../utils/apiError'

export function useAdminStats() {
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    async function loadStats() {
      setIsLoading(true)
      setError('')
      try {
        const data = await adminApi.getStats({ signal: controller.signal })
        if (!data || !['patients', 'doctors', 'appointments'].every((key) => Number.isFinite(Number(data[key])))) {
          throw new Error('The server returned invalid clinic statistics.')
        }
        setStats(data)
      } catch (requestError) {
        if (controller.signal.aborted) return
        setError(getApiErrorMessage(requestError, 'Unable to load clinic statistics.'))
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }

    loadStats()
    return () => controller.abort()
  }, [retryKey])

  return {
    stats,
    isLoading,
    error,
    retry: () => setRetryKey((current) => current + 1),
  }
}
