import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import AdminDashboardPage from '../pages/admin/DashboardPage'
import DoctorDashboardPage from '../pages/doctor/DashboardPage'
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import PatientDashboardPage from '../pages/patient/DashboardPage'
import PatientDoctorsPage from '../pages/patient/DoctorsPage'
import PatientAppointmentsPage from '../pages/patient/AppointmentsPage'
import BookAppointmentPage from '../pages/patient/BookAppointmentPage'
import DoctorRequestsPage from '../pages/doctor/RequestsPage'
import AdminUsersPage from '../pages/admin/UsersPage'
import AdminAppointmentsPage from '../pages/admin/AppointmentsPage'
import UiPreviewPage from '../pages/UiPreviewPage'
import ProtectedRoute from './ProtectedRoute'
import PublicOnlyRoute from './PublicOnlyRoute'
import { getDashboardPath } from '../utils/roleRoutes'

function HomeRedirect() {
  const { isAuthenticated, user } = useAuth()
  return <Navigate to={isAuthenticated ? getDashboardPath(user.role) : '/login'} replace />
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route path="/" element={<HomeRedirect />} />
      <Route path="/ui-preview" element={<UiPreviewPage />} />

      <Route element={<ProtectedRoute allowedRoles={['patient']} />}>
        <Route path="/patient/dashboard" element={<PatientDashboardPage />} />
        <Route path="/patient/doctors" element={<PatientDoctorsPage />} />
        <Route path="/patient/book/:doctorId" element={<BookAppointmentPage />} />
        <Route path="/patient/appointments" element={<PatientAppointmentsPage />} />
      </Route>
      <Route element={<ProtectedRoute allowedRoles={['doctor']} />}>
        <Route path="/doctor/dashboard" element={<DoctorDashboardPage />} />
        <Route path="/doctor/requests" element={<DoctorRequestsPage />} />
      </Route>
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/appointments" element={<AdminAppointmentsPage />} />
      </Route>

      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  )
}
