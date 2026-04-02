import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Sessions from './pages/Sessions'
import Insights from './pages/Insights'
import Reports from './pages/Reports'
import Onboarding from './pages/Onboarding'
import Settings from './pages/Settings'

function Sidebar() {
  const { logout, user } = useAuth()
  const location = useLocation()

  const navItems = [
    { path: '/dashboard', label: '📊 Dashboard' },
    { path: '/sessions', label: '📝 Sessions' },
    { path: '/insights', label: '🤖 Assistant', pro: true },
    { path: '/reports', label: '📋 Weekly Brief', pro: true },
    { path: '/settings', label: '⚙️ Settings' },
  ]

  return (
    <div style={sidebarStyles.sidebar}>
      <div>
        <div style={sidebarStyles.logo}>Deep Work AI</div>
        <div style={sidebarStyles.userInfo}>
          <span style={sidebarStyles.username}>{user?.username}</span>
          <span style={{
            ...sidebarStyles.planBadge,
            background: user?.plan === 'pro' ? '#6c63ff' : '#2a2a3a',
            color: user?.plan === 'pro' ? '#fff' : '#666'
          }}>
            {user?.plan === 'pro' ? '⚡ Pro' : 'Free'}
          </span>
        </div>
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
              {item.pro && user?.plan !== 'pro' && (
                <span style={sidebarStyles.proTag}>Pro</span>
              )}
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
  const { token, user, loading } = useAuth()
  if (loading) return <div style={{ color: '#fff', padding: '40px' }}>Loading...</div>
  if (!token) return <Navigate to="/login" replace />
  // Redirect to onboarding if not completed
  if (user && !user.onboarding_complete && window.location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />
  }
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
      <Route path="/sessions" element={<ProtectedRoute><AppLayout><Sessions /></AppLayout></ProtectedRoute>} />
      <Route path="/insights" element={<ProtectedRoute><AppLayout><Insights /></AppLayout></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><AppLayout><Reports /></AppLayout></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><AppLayout><Settings /></AppLayout></ProtectedRoute>} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

const sidebarStyles = {
  sidebar: { width: '220px', background: '#1a1a24', borderRight: '1px solid #2a2a3a', padding: '24px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '100vh' },
  logo: { color: '#fff', fontWeight: '700', fontSize: '16px', marginBottom: '8px' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px' },
  username: { color: '#666', fontSize: '12px' },
  planBadge: { fontSize: '10px', padding: '2px 6px', borderRadius: '8px', fontWeight: '600' },
  nav: { display: 'flex', flexDirection: 'column', gap: '4px' },
  navItem: { padding: '10px 12px', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: '500', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  proTag: { fontSize: '10px', background: '#6c63ff33', color: '#6c63ff', padding: '2px 6px', borderRadius: '6px', fontWeight: '600' },
  logout: { background: 'none', border: '1px solid #2a2a3a', color: '#888', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', width: '100%' }
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}