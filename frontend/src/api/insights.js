import axios from 'axios'

const API = 'http://localhost:8000'

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`
})

export const getStarterPrompts = () =>
  axios.get(`${API}/insights/starters`, { headers: getHeaders() })

export const sendMessage = (message, history) =>
  axios.post(`${API}/insights/chat`, { message, history }, { headers: getHeaders() })