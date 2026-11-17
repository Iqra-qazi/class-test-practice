export function getDashboardPath(role) {
  const dashboards = {
    admin: '/admin/dashboard',
    doctor: '/doctor/dashboard',
    patient: '/patient/dashboard',
  }

  return Object.prototype.hasOwnProperty.call(dashboards, role)
    ? dashboards[role]
    : '/login'
}
