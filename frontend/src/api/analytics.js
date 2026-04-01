import axios from 'axios'

const API = 'http://localhost:8000'

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`
})

export const getSummary = () =>
  axios.get(`${API}/analytics/summary`, { headers: getHeaders() })

export const getTrends = () =>
  axios.get(`${API}/analytics/trends`, { headers: getHeaders() })

export const getDistribution = () =>
  axios.get(`${API}/analytics/distribution`, { headers: getHeaders() })

export const getHeatmap = () =>
  axios.get(`${API}/analytics/heatmap`, { headers: getHeaders() })

export const getEnergy = () =>
  axios.get(`${API}/analytics/energy`, { headers: getHeaders() })