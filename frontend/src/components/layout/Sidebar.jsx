import {
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  Stethoscope,
  Users,
  X,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

const linksByRole = {
  patient: [
    { to: '/patient/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/patient/doctors', label: 'Find Doctors', icon: Stethoscope },
    { to: '/patient/appointments', label: 'My Appointments', icon: CalendarDays },
  ],
  doctor: [
    { to: '/doctor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/doctor/requests', label: 'Appointment Requests', icon: ClipboardList },
  ],
  admin: [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/users', label: 'Manage Users', icon: Users },
    { to: '/admin/appointments', label: 'All Appointments', icon: CalendarDays },
  ],
}

export default function Sidebar({ role, open, onClose }) {
  const links = Object.prototype.hasOwnProperty.call(linksByRole, role)
    ? linksByRole[role]
    : []

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-72 shrink-0 flex-col border-r border-clinic-line bg-white shadow-xl transition-transform duration-200 md:sticky md:top-0 md:h-screen md:translate-x-0 md:shadow-none ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
      aria-label={`${role ?? 'User'} navigation`}
    >
      <div className="flex items-center justify-between border-b border-clinic-line px-5 py-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-clinic-navy text-xl font-semibold text-clinic-ivory">
            +
          </span>
          <div>
            <p className="font-display text-lg leading-tight text-clinic-navy">WellSpring</p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-clinic-muted">Clinic portal</p>
          </div>
        </div>
        <button
          type="button"
          className="rounded-lg p-2 text-clinic-muted hover:bg-clinic-ivory md:hidden"
          aria-label="Close navigation menu"
          onClick={onClose}
        >
          <X size={19} />
        </button>
      </div>

      <div className="px-5 pb-2 pt-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.17em] text-clinic-muted">Workspace</p>
      </div>
      <nav className="space-y-1 px-3" aria-label="Main navigation">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            onClick={onClose}
            className={({ isActive }) => `flex min-h-11 items-center gap-3 rounded-xl px-3.5 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-clinic-navy text-white shadow-sm'
                : 'text-clinic-muted hover:bg-clinic-ivory hover:text-clinic-navy'
            }`}
          >
            <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto border-t border-clinic-line px-5 py-5">
        <div className="rounded-2xl bg-clinic-ivory p-4">
          <p className="font-display text-base text-clinic-navy">Here for your health</p>
          <p className="mt-1 text-xs leading-5 text-clinic-muted">A more considered way to manage care.</p>
        </div>
      </div>
    </aside>
  )
}
