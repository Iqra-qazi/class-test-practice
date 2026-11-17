import apiClient from './apiClient'

export const adminApi = {
  async getStats({ signal } = {}) {
    const response = await apiClient.get('/admin/stats', { signal })
    return response.data.data
  },

  async listUsers(search = '', { signal } = {}) {
    const query = search.trim()
    const response = await apiClient.get('/admin/users', {
      params: query ? { search: query } : undefined,
      signal,
    })
    return response.data.data
  },

  async createDoctor(doctor) {
    const response = await apiClient.post('/admin/doctors', doctor)
    return response.data.data
  },

  async updateUserStatus(id, isActive) {
    const response = await apiClient.patch(
      `/admin/users/${encodeURIComponent(id)}/status`,
      { isActive },
    )
    return response.data.data
  },

  async deleteUser(id) {
    const response = await apiClient.delete(`/admin/users/${encodeURIComponent(id)}`)
    return response.data
  },

  async listAppointments({ signal } = {}) {
    const response = await apiClient.get('/admin/appointments', { signal })
    return response.data.data
  },
}
