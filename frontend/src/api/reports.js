import axios from 'axios'

const API = 'http://localhost:8000'

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`
})

export const generateReport = () =>
  axios.post(`${API}/reports/generate`, {}, { headers: getHeaders() })

export const getReports = () =>
  axios.get(`${API}/reports/`, { headers: getHeaders() })