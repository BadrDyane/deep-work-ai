import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Sessions from './pages/Sessions'

function Sidebar() {
  const { logout, user } = useAuth()
  const location = useLocation()

  const navItems = [
    { path: '/dashboard', label: '📊 Dashboard' },
    { path: '/sessions', label: '📝 Sessions' },
  ]

  return (
    <div style={sidebarStyles.sidebar}>
      <div>
        <div style={sidebarStyles.logo}>Deep Work AI</div>
        <div style={sidebarStyles.username}>{user?.username}</div>
        <nav style={sidebarStyles.nav}>
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                ...sidebarStyles.navItem,
                background: location.pathname === item.path ? '#2a2a3a' : 'transparent',
                color: location.pathname === item.path ? '#fff' : '#888'
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <button onClick={logout} style={sidebarStyles.logout}>Logout</button>
    </div>
  )
}

function AppLayout({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0f0f13' }}>
      <Sidebar />
      <main style={{ flex: 1, overflowY: 'auto' }}>{children}</main>
    </div>
  )
}

function ProtectedRoute({ children }) {
  const { token, loading } = useAuth()
  if (loading) return <div style={{ color: '#fff', padding: '40px' }}>Loading...</div>
  return token ? children : <Navigate to="/login" replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <AppLayout><Dashboard /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/sessions" element={
        <ProtectedRoute>
          <AppLayout><Sessions /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

const sidebarStyles = {
  sidebar: { width: '220px', background: '#1a1a24', borderRight: '1px solid #2a2a3a', padding: '24px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '100vh' },
  logo: { color: '#fff', fontWeight: '700', fontSize: '16px', marginBottom: '4px' },
  username: { color: '#666', fontSize: '12px', marginBottom: '32px' },
  nav: { display: 'flex', flexDirection: 'column', gap: '4px' },
  navItem: { padding: '10px 12px', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: '500', display: 'block' },
  logout: { background: 'none', border: '1px solid #2a2a3a', color: '#888', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', width: '100%' }
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}