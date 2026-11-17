import apiClient from './apiClient'

export const doctorApi = {
  async listDoctors(search = '', { signal } = {}) {
    const query = search.trim()
    const response = await apiClient.get('/doctors', {
      params: query ? { search: query } : undefined,
      signal,
    })
    return response.data.data
  },

  async getDoctor(id, { signal } = {}) {
    const response = await apiClient.get(`/doctors/${encodeURIComponent(id)}`, { signal })
    return response.data.data
  },
}
