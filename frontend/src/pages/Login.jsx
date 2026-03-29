import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const API = 'http://localhost:8000'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await axios.post(`${API}/auth/login`, form)
      login(res.data.access_token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Deep Work AI</h1>
        <p style={styles.subtitle}>Sign in to your account</p>
        {error && <p style={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            style={styles.input}
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            required
          />
          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p style={styles.link}>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f0f13' },
  card: { background: '#1a1a24', padding: '40px', borderRadius: '12px', width: '100%', maxWidth: '400px', border: '1px solid #2a2a3a' },
  title: { color: '#ffffff', fontSize: '24px', fontWeight: '700', marginBottom: '4px', textAlign: 'center' },
  subtitle: { color: '#888', fontSize: '14px', textAlign: 'center', marginBottom: '28px' },
  form: { display: 'flex', flexDirection: 'column', gap: '14px' },
  input: { padding: '12px 14px', borderRadius: '8px', border: '1px solid #2a2a3a', background: '#0f0f13', color: '#fff', fontSize: '14px', outline: 'none' },
  button: { padding: '12px', borderRadius: '8px', background: '#6c63ff', color: '#fff', fontWeight: '600', fontSize: '15px', border: 'none', cursor: 'pointer' },
  error: { color: '#ff6b6b', fontSize: '13px', marginBottom: '8px', textAlign: 'center' },
  link: { color: '#888', fontSize: '13px', textAlign: 'center', marginTop: '20px' }
}