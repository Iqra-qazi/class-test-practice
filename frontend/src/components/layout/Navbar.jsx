import { LogOut, Menu } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import Button from '../ui/Button'

const roleLabels = {
  patient: 'Patient',
  doctor: 'Doctor',
  admin: 'Administrator',
}

function getRoleLabel(role) {
  return Object.prototype.hasOwnProperty.call(roleLabels, role)
    ? roleLabels[role]
    : 'Member'
}

export default function Navbar({ title, onMenuClick }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="sticky top-0 z-30 flex min-h-[76px] items-center justify-between gap-3 border-b border-clinic-line bg-clinic-ivory/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-clinic-line bg-white text-clinic-navy transition hover:border-clinic-teal hover:text-clinic-teal md:hidden"
          aria-label="Open navigation menu"
          onClick={onMenuClick}
        >
          <Menu size={20} />
        </button>
        <div className="min-w-0">
          <p className="truncate font-display text-xl text-clinic-navy sm:text-2xl">{title}</p>
          <p className="hidden text-xs text-clinic-muted sm:block">A thoughtful space for better care.</p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        <div className="max-w-24 text-right sm:max-w-40">
          <p className="truncate text-xs font-semibold text-clinic-ink sm:text-sm">{user?.name ?? 'Account'}</p>
          <p className="mt-0.5 hidden truncate text-xs text-clinic-muted sm:block">{user?.email ?? ''}</p>
        </div>
        <span className="rounded-full border border-clinic-teal/15 bg-clinic-teal/10 px-2.5 py-1 text-xs font-semibold text-clinic-teal">
          {getRoleLabel(user?.role)}
        </span>
        <Button
          variant="secondary"
          className="min-h-10 px-3 py-2"
          onClick={handleLogout}
          aria-label="Log out"
        >
          <LogOut size={16} aria-hidden="true" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  )
}
