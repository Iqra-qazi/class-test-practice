import DashboardLayout from '../components/layout/DashboardLayout'
import EmptyState from '../components/ui/EmptyState'

export default function SectionPlaceholderPage({ title, description }) {
  return (
    <DashboardLayout title={title}>
      <EmptyState
        title={`${title} is coming soon`}
        description={description ?? 'This section will be added in its module step.'}
      />
    </DashboardLayout>
  )
}
