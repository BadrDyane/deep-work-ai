import axios from 'axios'

const API = 'http://localhost:8000'

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`
})

export const getBillingStatus = () =>
  axios.get(`${API}/billing/status`, { headers: getHeaders() })

export const upgradePlan = (plan) =>
  axios.post(`${API}/billing/upgrade`, { plan }, { headers: getHeaders() })