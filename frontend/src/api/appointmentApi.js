import apiClient from './apiClient'

export const appointmentApi = {
  async getMyAppointments({ signal } = {}) {
    const response = await apiClient.get('/appointments/my', { signal })
    return response.data.data
  },

  async getDoctorAppointments({ signal } = {}) {
    const response = await apiClient.get('/appointments/doctor', { signal })
    return response.data.data
  },

  async bookAppointment(appointment) {
    const response = await apiClient.post('/appointments', appointment)
    return response.data.data
  },

  async updateAppointmentStatus(id, status) {
    const response = await apiClient.patch(
      `/appointments/${encodeURIComponent(id)}/status`,
      { status },
    )
    return response.data.data
  },

  async cancelAppointment(id) {
    const response = await apiClient.patch(`/appointments/${encodeURIComponent(id)}/cancel`)
    return response.data.data
  },
}
