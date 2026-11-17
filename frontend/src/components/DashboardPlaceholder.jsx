import DashboardLayout from './layout/DashboardLayout'

export default function DashboardPlaceholder({ role, title, description }) {
  return (
    <DashboardLayout title="Dashboard">
      <section className="rounded-3xl border border-clinic-line bg-white p-6 shadow-card sm:p-9">
        <p className="text-sm font-semibold capitalize text-clinic-teal">{role} workspace</p>
        <h1 className="mt-2 font-display text-3xl text-clinic-navy sm:text-4xl">{title}</h1>
        <p className="mt-4 max-w-2xl leading-7 text-clinic-muted">{description}</p>
        <div className="mt-8 rounded-2xl bg-clinic-ivory px-5 py-4 text-sm text-clinic-muted">
          This dashboard is a temporary placeholder for testing authentication and role-based access.
        </div>
      </section>
    </DashboardLayout>
  )
}
