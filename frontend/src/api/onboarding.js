import axios from 'axios'

const API = 'http://localhost:8000'

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`
})

export const completeOnboarding = (data) =>
  axios.post(`${API}/onboarding/complete`, data, { headers: getHeaders() })