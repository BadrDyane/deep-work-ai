import { useState, useEffect } from 'react'
import { getBillingStatus, upgradePlan } from '../api/billing'
import { useAuth } from '../context/AuthContext'

export default function Settings() {
  const { user, refreshUser } = useAuth()
  const [billing, setBilling] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    getBillingStatus()
      .then(res => setBilling(res.data))
      .catch(() => {})
  }, [])

  const handleUpgrade = async (plan) => {
    setLoading(true)
    setMessage('')
    try {
      const res = await upgradePlan(plan)
      setBilling({ plan: res.data.plan, is_pro: res.data.is_pro })
      setMessage(plan === 'pro' ? '🎉 Upgraded to Pro! All features unlocked.' : 'Downgraded to Free plan.')
      await refreshUser()
    } catch {
      setMessage('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Settings</h2>

      {/* Account info */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Account</h3>
        <div style={styles.infoRow}>
          <span style={styles.label}>Username</span>
          <span style={styles.value}>{user?.username}</span>
        </div>
        <div style={styles.infoRow}>
          <span style={styles.label}>Email</span>
          <span style={styles.value}>{user?.email}</span>
        </div>
        <div style={styles.infoRow}>
          <span style={styles.label}>Daily Focus Goal</span>
          <span style={styles.value}>{user?.daily_focus_goal} hours</span>
        </div>
      </div>

      {/* Plan */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Plan</h3>
        {message && <p style={{ color: billing?.is_pro ? '#10b981' : '#f59e0b', fontSize: '14px', marginBottom: '16px' }}>{message}</p>}

        <div style={styles.planGrid}>
          {/* Free plan */}
          <div style={{
            ...styles.planCard,
            border: !billing?.is_pro ? '1px solid #6c63ff' : '1px solid #2a2a3a'
          }}>
            <div style={styles.planHeader}>
              <h4 style={styles.planName}>Free</h4>
              {!billing?.is_pro && <span style={styles.currentBadge}>Current</span>}
            </div>
            <p style={styles.planPrice}>$0 / month</p>
            <ul style={styles.planFeatures}>
              <li style={styles.feature}>✓ Session logging</li>
              <li style={styles.feature}>✓ Analytics dashboard</li>
              <li style={styles.feature}>✓ Productivity heatmap</li>
              <li style={{ ...styles.feature, color: '#555' }}>✗ AI Productivity Assistant</li>
              <li style={{ ...styles.feature, color: '#555' }}>✗ Weekly Brief</li>
              <li style={{ ...styles.feature, color: '#555' }}>✗ Full session history</li>
            </ul>
            {billing?.is_pro && (
              <button
                style={{ ...styles.planBtn, background: '#2a2a3a', color: '#888' }}
                onClick={() => handleUpgrade('free')}
                disabled={loading}
              >
                Downgrade
              </button>
            )}
          </div>

          {/* Pro plan */}
          <div style={{
            ...styles.planCard,
            border: billing?.is_pro ? '1px solid #6c63ff' : '1px solid #2a2a3a',
            background: billing?.is_pro ? '#1a1a3a' : '#1a1a24'
          }}>
            <div style={styles.planHeader}>
              <h4 style={styles.planName}>Pro ⚡</h4>
              {billing?.is_pro && <span style={styles.currentBadge}>Current</span>}
            </div>
            <p style={styles.planPrice}>$12 / month</p>
            <ul style={styles.planFeatures}>
              <li style={styles.feature}>✓ Everything in Free</li>
              <li style={styles.feature}>✓ AI Productivity Assistant</li>
              <li style={styles.feature}>✓ Weekly Brief Generator</li>
              <li style={styles.feature}>✓ Full session history</li>
              <li style={styles.feature}>✓ Priority support</li>
            </ul>
            {!billing?.is_pro && (
              <button
                style={{ ...styles.planBtn, background: '#6c63ff', color: '#fff' }}
                onClick={() => handleUpgrade('pro')}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Upgrade to Pro'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: { padding: '32px', maxWidth: '700px', margin: '0 auto' },
  title: { color: '#fff', fontSize: '20px', fontWeight: '700', marginBottom: '28px' },
  section: { background: '#1a1a24', border: '1px solid #2a2a3a', borderRadius: '12px', padding: '24px', marginBottom: '24px' },
  sectionTitle: { color: '#fff', fontSize: '15px', fontWeight: '600', margin: '0 0 20px 0' },
  infoRow: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #2a2a3a' },
  label: { color: '#888', fontSize: '14px' },
  value: { color: '#fff', fontSize: '14px', fontWeight: '500' },
  planGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  planCard: { borderRadius: '12px', padding: '20px', background: '#1a1a24' },
  planHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  planName: { color: '#fff', fontSize: '16px', fontWeight: '700', margin: 0 },
  currentBadge: { background: '#6c63ff', color: '#fff', fontSize: '11px', padding: '2px 8px', borderRadius: '10px', fontWeight: '600' },
  planPrice: { color: '#888', fontSize: '14px', margin: '0 0 16px 0' },
  planFeatures: { listStyle: 'none', padding: 0, margin: '0 0 16px 0', display: 'flex', flexDirection: 'column', gap: '8px' },
  feature: { color: '#ccc', fontSize: '13px' },
  planBtn: { width: '100%', padding: '10px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }
}