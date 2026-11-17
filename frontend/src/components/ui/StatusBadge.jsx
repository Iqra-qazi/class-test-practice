const statuses = {
  pending: 'bg-amber-100 text-amber-800 ring-amber-700/10',
  approved: 'bg-green-100 text-green-800 ring-green-700/10',
  rejected: 'bg-red-100 text-red-800 ring-red-700/10',
  cancelled: 'bg-gray-100 text-gray-700 ring-gray-600/10',
}

export default function StatusBadge({ status }) {
  const normalizedStatus = typeof status === 'string' ? status.toLowerCase() : ''
  const label = normalizedStatus
    ? `${normalizedStatus[0].toUpperCase()}${normalizedStatus.slice(1)}`
    : 'Unknown'

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statuses[normalizedStatus] ?? 'bg-gray-100 text-gray-600 ring-gray-500/10'}`}>
      {label}
    </span>
  )
}
