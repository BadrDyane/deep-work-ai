import { useState, useEffect } from 'react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { getSummary, getTrends, getDistribution, getHeatmap, getEnergy } from '../api/analytics'
import { useAuth } from '../context/AuthContext'
import ProductivityHeatmap from '../components/ProductivityHeatmap'

const TASK_COLORS = {
  'deep work': '#6c63ff',
  'meetings': '#f59e0b',
  'admin': '#64748b',
  'learning': '#10b981',
  'planning': '#3b82f6',
  'creative': '#ec4899',
  'communication': '#f97316'
}

const PIE_COLORS = ['#6c63ff', '#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#f97316', '#64748b']

export default function Dashboard() {
  const { user } = useAuth()
  const [summary, setSummary] = useState(null)
  const [trends, setTrends] = useState([])
  const [distribution, setDistribution] = useState([])
  const [heatmap, setHeatmap] = useState([])
  const [energy, setEnergy] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [s, t, d, h, e] = await Promise.all([
          getSummary(), getTrends(), getDistribution(), getHeatmap(), getEnergy()
        ])
        setSummary(s.data)
        setTrends(t.data)
        setDistribution(d.data)
        setHeatmap(h.data)
        setEnergy(e.data)
      } catch (err) {
        console.error('Failed to load analytics', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const scoreColor = (score) => {
    if (score >= 7) return '#10b981'
    if (score >= 4) return '#f59e0b'
    return '#ef4444'
  }

  if (loading) return (
    <div style={{ padding: '40px', color: '#888' }}>Loading dashboard...</div>
  )

  return (
    <div style={styles.container}>
      <div style={styles.pageHeader}>
        <h1 style={styles.heading}>Welcome back, {user?.username} 👋</h1>
        <p style={styles.subtext}>Here's your productivity overview.</p>
      </div>

      {/* Stat Cards */}
      <div style={styles.statsGrid}>
        <StatCard label="Total Sessions" value={summary?.total_sessions} unit="" />
        <StatCard label="Total Focus Hours" value={summary?.total_hours} unit="hrs" />
        <StatCard label="Avg Score" value={summary?.avg_productivity_score} unit="/10" color={scoreColor(summary?.avg_productivity_score)} />
        <StatCard label="This Week" value={summary?.sessions_this_week} unit=" sessions" />
        <StatCard label="Best Score" value={summary?.best_score} unit="/10" color={scoreColor(summary?.best_score)} />
      </div>

      {/* Productivity Score Trend */}
      <div style={styles.chartCard}>
        <h3 style={styles.chartTitle}>Productivity Score — Last 14 Days</h3>
        {trends.length === 0 ? (
          <EmptyChart />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
              <XAxis dataKey="date" tick={{ fill: '#666', fontSize: 11 }} tickFormatter={d => d.slice(5)} />
              <YAxis domain={[0, 10]} tick={{ fill: '#666', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1a1a24', border: '1px solid #2a2a3a', borderRadius: '8px', color: '#fff' }} />
              <Line type="monotone" dataKey="avg_score" stroke="#6c63ff" strokeWidth={2} dot={{ fill: '#6c63ff', r: 4 }} name="Avg Score" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Sessions per day + Energy/Distraction */}
      <div style={styles.twoCol}>
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Sessions per Day</h3>
          {trends.length === 0 ? <EmptyChart /> : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
                <XAxis dataKey="date" tick={{ fill: '#666', fontSize: 11 }} tickFormatter={d => d.slice(5)} />
                <YAxis tick={{ fill: '#666', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1a1a24', border: '1px solid #2a2a3a', borderRadius: '8px', color: '#fff' }} />
                <Bar dataKey="session_count" fill="#6c63ff" radius={[4, 4, 0, 0]} name="Sessions" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Energy vs Distraction</h3>
          {energy.length === 0 ? <EmptyChart /> : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={energy}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
                <XAxis dataKey="date" tick={{ fill: '#666', fontSize: 11 }} tickFormatter={d => d.slice(5)} />
                <YAxis domain={[0, 5]} tick={{ fill: '#666', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1a1a24', border: '1px solid #2a2a3a', borderRadius: '8px', color: '#fff' }} />
                <Line type="monotone" dataKey="avg_energy" stroke="#10b981" strokeWidth={2} dot={false} name="Energy" />
                <Line type="monotone" dataKey="avg_distraction" stroke="#ef4444" strokeWidth={2} dot={false} name="Distraction" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Task Distribution + Heatmap */}
      <div style={styles.twoCol}>
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Task Type Breakdown</h3>
          {distribution.length === 0 ? <EmptyChart /> : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={distribution} dataKey="count" nameKey="task_type" cx="50%" cy="50%" outerRadius={80} label={({ task_type, percent }) => `${task_type} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {distribution.map((entry, index) => (
                      <Cell key={index} fill={TASK_COLORS[entry.task_type] || PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1a1a24', border: '1px solid #2a2a3a', borderRadius: '8px', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            </>
          )}
        </div>

        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Focus Minutes per Day</h3>
          {trends.length === 0 ? <EmptyChart /> : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
                <XAxis dataKey="date" tick={{ fill: '#666', fontSize: 11 }} tickFormatter={d => d.slice(5)} />
                <YAxis tick={{ fill: '#666', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1a1a24', border: '1px solid #2a2a3a', borderRadius: '8px', color: '#fff' }} />
                <Bar dataKey="total_minutes" fill="#10b981" radius={[4, 4, 0, 0]} name="Minutes" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Heatmap */}
      <ProductivityHeatmap data={heatmap} />
    </div>
  )
}

function StatCard({ label, value, unit, color }) {
  return (
    <div style={styles.statCard}>
      <p style={styles.statLabel}>{label}</p>
      <p style={{ ...styles.statValue, color: color || '#fff' }}>
        {value ?? '—'}{unit}
      </p>
    </div>
  )
}

function EmptyChart() {
  return (
    <div style={styles.emptyChart}>
      <p>No data yet — log some sessions first.</p>
    </div>
  )
}

const styles = {
  container: { padding: '32px', maxWidth: '1100px', margin: '0 auto' },
  pageHeader: { marginBottom: '28px' },
  heading: { color: '#fff', fontSize: '22px', fontWeight: '700', margin: 0 },
  subtext: { color: '#888', fontSize: '14px', marginTop: '4px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '24px' },
  statCard: { background: '#1a1a24', borderRadius: '12px', padding: '20px', border: '1px solid #2a2a3a' },
  statLabel: { color: '#888', fontSize: '12px', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px' },
  statValue: { color: '#fff', fontSize: '26px', fontWeight: '700', margin: 0 },
  chartCard: { background: '#1a1a24', borderRadius: '12px', padding: '24px', border: '1px solid #2a2a3a', marginBottom: '24px' },
  chartTitle: { color: '#fff', fontSize: '15px', fontWeight: '600', margin: '0 0 20px 0' },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' },
  emptyChart: { height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontSize: '13px' }
}