export default function AuthField({
  id,
  label,
  error,
  ...inputProps
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-clinic-ink">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-clinic-ink outline-none transition placeholder:text-clinic-muted/70 focus:border-clinic-teal focus:ring-2 focus:ring-clinic-teal/15 ${
          error ? 'border-clinic-danger' : 'border-clinic-line'
        }`}
        {...inputProps}
      />
      {error && (
        <p id={`${id}-error`} className="text-sm text-clinic-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
