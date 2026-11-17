import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = 'max-w-lg',
}) {
  useEffect(() => {
    if (!open) return undefined

    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose?.()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-clinic-navy/45 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.()
      }}
    >
      <section
        aria-labelledby="modal-title"
        aria-describedby={description ? 'modal-description' : undefined}
        aria-modal="true"
        className={`my-auto w-full ${size} rounded-2xl border border-clinic-line bg-white shadow-2xl`}
        role="dialog"
      >
        <header className="flex items-start justify-between gap-4 border-b border-clinic-line px-5 py-4 sm:px-6">
          <div>
            <h2 id="modal-title" className="font-display text-xl text-clinic-navy">{title}</h2>
            {description && <p id="modal-description" className="mt-1 text-sm text-clinic-muted">{description}</p>}
          </div>
          <button
            type="button"
            className="rounded-lg p-2 text-clinic-muted transition hover:bg-clinic-ivory hover:text-clinic-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clinic-teal"
            aria-label="Close dialog"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </header>
        <div className="p-5 sm:p-6">{children}</div>
      </section>
    </div>,
    document.body,
  )
}
