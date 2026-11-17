export default function Select({
  id,
  label,
  error,
  hint,
  options = [],
  className = '',
  placeholder,
  ...props
}) {
  const describedBy = [
    hint ? `${id}-hint` : null,
    error ? `${id}-error` : null,
  ].filter(Boolean).join(' ') || undefined

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-clinic-ink">
          {label}
        </label>
      )}
      <select
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={`min-h-11 w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-clinic-ink outline-none transition focus:border-clinic-teal focus:ring-2 focus:ring-clinic-teal/15 ${error ? 'border-clinic-danger' : 'border-clinic-line'} ${className}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
      {hint && !error && <p id={`${id}-hint`} className="text-xs text-clinic-muted">{hint}</p>}
      {error && <p id={`${id}-error`} className="text-sm text-clinic-danger" role="alert">{error}</p>}
    </div>
  )
}
