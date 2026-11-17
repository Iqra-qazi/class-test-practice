export function getApiErrorMessage(error, fallback) {
  const message = error?.response?.data?.message
  if (typeof message === 'string' && message.trim()) {
    return message
  }
  if (typeof error?.message === 'string' && error.message.trim()) {
    return error.message
  }
  return fallback
}
