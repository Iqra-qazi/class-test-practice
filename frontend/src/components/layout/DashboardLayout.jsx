import { useState } from 'react'
import { useAuth } from '../../context/useAuth'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

export default function DashboardLayout({ title, children }) {
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-clinic-ivory md:flex">
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-clinic-navy/40 md:hidden"
          aria-label="Close navigation menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <Sidebar
        role={user?.role}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Navbar title={title} onMenuClick={() => setSidebarOpen(true)} />
        <main className="w-full flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
