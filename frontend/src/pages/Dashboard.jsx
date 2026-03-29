import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { user, logout } = useAuth()
  return (
    <div style={{ padding: '40px', color: '#fff', background: '#0f0f13', minHeight: '100vh' }}>
      <h1>Welcome, {user?.username} 👋</h1>
      <p style={{ color: '#888' }}>Dashboard coming on Day 3.</p>
      <button onClick={logout} style={{ marginTop: '20px', padding: '10px 20px', background: '#ff6b6b', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
        Logout
      </button>
    </div>
  )
}