import apiClient from './apiClient'

export const authApi = {
  async login(credentials) {
    const response = await apiClient.post('/auth/login', credentials)
    return response.data
  },

  async register(patientDetails) {
    const response = await apiClient.post('/auth/register', patientDetails)
    return response.data
  },
}
