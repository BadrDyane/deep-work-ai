import axios from 'axios'

const API = 'http://localhost:8000'

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`
})

export const createSession = (rawText) =>
  axios.post(`${API}/sessions/`, { raw_text: rawText }, { headers: getHeaders() })

export const getSessions = () =>
  axios.get(`${API}/sessions/`, { headers: getHeaders() })

export const deleteSession = (id) =>
  axios.delete(`${API}/sessions/${id}`, { headers: getHeaders() })