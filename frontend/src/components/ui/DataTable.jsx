import EmptyState from './EmptyState'

function getCellValue(row, column) {
  if (typeof column.render === 'function') {
    return column.render(row)
  }
  return row?.[column.key] ?? '—'
}

export default function DataTable({
  columns = [],
  rows = [],
  getRowKey = (row, index) => row?.id ?? row?._id ?? index,
  emptyTitle = 'No records found',
  emptyDescription = 'There is nothing to display right now.',
}) {
  const safeColumns = Array.isArray(columns) ? columns : []
  const safeRows = Array.isArray(rows) ? rows : []

  if (!safeRows.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />
  }

  return (
    <div>
      <div className="space-y-3 lg:hidden">
        {safeRows.map((row, rowIndex) => (
          <article
            key={getRowKey(row, rowIndex)}
            className="rounded-xl border border-clinic-line bg-white p-4 shadow-sm"
          >
            <dl className="grid gap-3">
              {safeColumns.map((column) => (
                <div key={column.key} className="grid grid-cols-[minmax(6rem,0.75fr)_minmax(0,1.25fr)] gap-3">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-clinic-muted">{column.label}</dt>
                  <dd className="min-w-0 break-words text-sm text-clinic-ink">{getCellValue(row, column)}</dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-2xl border border-clinic-line bg-white lg:block">
        <table className="min-w-full divide-y divide-clinic-line text-left text-sm">
          <thead className="bg-clinic-ivory/70">
            <tr>
              {safeColumns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`whitespace-nowrap px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-clinic-muted ${column.headerClassName ?? ''}`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-clinic-line">
            {safeRows.map((row, rowIndex) => (
              <tr key={getRowKey(row, rowIndex)} className="transition-colors hover:bg-clinic-ivory/40">
                {safeColumns.map((column) => (
                  <td key={column.key} className={`px-5 py-4 text-clinic-ink ${column.className ?? ''}`}>
                    {getCellValue(row, column)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
