import { useState } from 'react'
import { CalendarDays, CheckCircle2, Clock3, Users } from 'lucide-react'
import DashboardLayout from '../components/layout/DashboardLayout'
import Button from '../components/ui/Button'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import DataTable from '../components/ui/DataTable'
import EmptyState from '../components/ui/EmptyState'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import Select from '../components/ui/Select'
import { Loader, Skeleton } from '../components/ui/Loader'
import StatCard from '../components/ui/StatCard'
import StatusBadge from '../components/ui/StatusBadge'

const previewRows = [
  { id: 'preview-1', patient: 'Sample patient', doctor: 'Dr. Sample', date: 'Nov 18, 2026', status: 'pending' },
  { id: 'preview-2', patient: 'Example patient', doctor: 'Dr. Example', date: 'Nov 20, 2026', status: 'approved' },
]

const previewColumns = [
  { key: 'patient', label: 'Patient' },
  { key: 'doctor', label: 'Doctor' },
  { key: 'date', label: 'Date' },
  { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
]

function PreviewSection({ title, children }) {
  return (
    <section className="rounded-2xl border border-clinic-line bg-white p-5 shadow-card sm:p-6">
      <h2 className="mb-5 font-display text-xl text-clinic-navy">{title}</h2>
      {children}
    </section>
  )
}

export default function UiPreviewPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [specialization, setSpecialization] = useState('')

  return (
    <DashboardLayout title="UI component preview">
      <div className="space-y-7">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-clinic-gold">Temporary preview</p>
          <h1 className="mt-1 font-display text-3xl text-clinic-navy">Shared interface components</h1>
          <p className="mt-2 text-sm leading-6 text-clinic-muted">
            Sample content below is for visual review only. No API requests are made on this page.
          </p>
        </div>

        <PreviewSection title="Buttons">
          <div className="flex flex-wrap gap-3">
            <Button>Primary action</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Quiet action</Button>
            <Button variant="danger">Destructive</Button>
            <Button loading>Saving</Button>
          </div>
        </PreviewSection>

        <div className="grid gap-4 md:grid-cols-2">
          <PreviewSection title="Form controls">
            <div className="space-y-4">
              <Input id="preview-name" label="Full name" placeholder="Enter a name" hint="A short helper message." />
              <Input id="preview-error" label="Email address" value="not-an-email" readOnly error="Enter a valid email address." />
              <Select
                id="preview-specialty"
                label="Specialization"
                value={specialization}
                onChange={(event) => setSpecialization(event.target.value)}
                placeholder="Choose a specialty"
                options={[
                  { value: 'cardiology', label: 'Cardiology' },
                  { value: 'pediatrics', label: 'Pediatrics' },
                  { value: 'dermatology', label: 'Dermatology' },
                ]}
              />
            </div>
          </PreviewSection>

          <PreviewSection title="Status badges">
            <div className="flex flex-wrap gap-2">
              {['pending', 'approved', 'rejected', 'cancelled'].map((status) => (
                <StatusBadge key={status} status={status} />
              ))}
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Button variant="secondary" onClick={() => setModalOpen(true)}>Open modal</Button>
              <Button variant="secondary" onClick={() => setConfirmOpen(true)}>Open confirmation</Button>
            </div>
            {confirmed && <p className="mt-4 text-sm text-clinic-success">Preview confirmation accepted.</p>}
          </PreviewSection>
        </div>

        <PreviewSection title="Statistics">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Patients" value="128" icon={<Users size={20} />} tone="teal" detail="Illustrative preview value" />
            <StatCard label="Appointments" value="42" icon={<CalendarDays size={20} />} tone="gold" />
            <StatCard label="Approved" value="31" icon={<CheckCircle2 size={20} />} tone="green" />
            <StatCard label="Pending" value="11" icon={<Clock3 size={20} />} tone="amber" />
          </div>
        </PreviewSection>

        <PreviewSection title="Responsive data table">
          <DataTable columns={previewColumns} rows={previewRows} getRowKey={(row) => row.id} />
        </PreviewSection>

        <div className="grid gap-4 md:grid-cols-2">
          <PreviewSection title="Loading states">
            <Loader label="Loading appointments" />
            <Skeleton rows={3} />
          </PreviewSection>
          <PreviewSection title="Empty state">
            <EmptyState
              title="No appointments yet"
              description="When appointments are available, they will appear here."
            />
          </PreviewSection>
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Example modal"
        description="A calm, reusable dialog for forms and details."
      >
        <p className="text-sm leading-6 text-clinic-muted">
          Modal content can include forms, confirmation details, or other shared interface elements.
        </p>
        <div className="mt-5 flex justify-end">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>Close</Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmed(true)
          setConfirmOpen(false)
        }}
        title="Confirm preview action"
        description="This is an example confirmation and will not change server data."
        confirmLabel="Confirm"
        variant="primary"
      />
    </DashboardLayout>
  )
}
