import { useState, useEffect } from 'react'
import { createSession, getSessions, deleteSession } from '../api/sessions'

const TASK_COLORS = {
  'deep work': '#6c63ff',
  'meetings': '#f59e0b',
  'admin': '#64748b',
  'learning': '#10b981',
  'planning': '#3b82f6',
  'creative': '#ec4899',
  'communication': '#f97316'
}

export default function Sessions() {
  const [sessions, setSessions] = useState([])
  const [rawText, setRawText] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      const res = await getSessions()
      setSessions(res.data)
    } catch {
      setError('Failed to load sessions')
    } finally {
      setFetchLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!rawText.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await createSession(rawText)
      setSessions([res.data, ...sessions])
      setRawText('')
    } catch {
      setError('Failed to log session. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteSession(id)
      setSessions(sessions.filter(s => s.id !== id))
    } catch {
      setError('Failed to delete session')
    }
  }

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const renderScore = (score) => {
    const color = score >= 7 ? '#10b981' : score >= 4 ? '#f59e0b' : '#ef4444'
    return <span style={{ color, fontWeight: '700' }}>{score?.toFixed(1)}</span>
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Log a Session</h2>
      <p style={styles.subtext}>
        Describe your work session in plain English. The AI will extract the details automatically.
      </p>

      <div style={styles.inputCard}>
        <textarea
          style={styles.textarea}
          placeholder={`Example: "Spent 90 minutes working on the login flow. Got distracted by Slack a few times but finished the form validation. Feeling pretty good about it."`}
          value={rawText}
          onChange={e => setRawText(e.target.value)}
          rows={4}
        />
        {error && <p style={styles.error}>{error}</p>}
        <div style={styles.inputFooter}>
          <span style={styles.charCount}>{rawText.length} characters</span>
          <button
            style={{ ...styles.button, opacity: loading || !rawText.trim() ? 0.6 : 1 }}
            onClick={handleSubmit}
            disabled={loading || !rawText.trim()}
          >
            {loading ? '🤖 Analyzing...' : '+ Log Session'}
          </button>
        </div>
      </div>

      <h2 style={{ ...styles.heading, marginTop: '40px' }}>Session History</h2>

      {fetchLoading ? (
        <p style={styles.subtext}>Loading sessions...</p>
      ) : sessions.length === 0 ? (
        <div style={styles.emptyState}>
          <p>No sessions logged yet.</p>
          <p style={{ color: '#666', fontSize: '14px' }}>Describe your first work session above.</p>
        </div>
      ) : (
        <div style={styles.sessionList}>
          {sessions.map(session => (
            <div key={session.id} style={styles.sessionCard}>
              <div style={styles.sessionHeader}>
                <div style={styles.sessionMeta}>
                  <span style={{
                    ...styles.taskBadge,
                    background: TASK_COLORS[session.task_type] || '#6c63ff'
                  }}>
                    {session.task_type}
                  </span>
                  <span style={styles.sessionDate}>{formatDate(session.session_date)}</span>
                </div>
                <button
                  style={styles.deleteBtn}
                  onClick={() => handleDelete(session.id)}
                >
                  ✕
                </button>
              </div>

              <p style={styles.summary}>{session.summary || session.raw_text}</p>

              <div style={styles.statsRow}>
                <div style={styles.stat}>
                  <span style={styles.statLabel}>Duration</span>
                  <span style={styles.statValue}>
                    {session.duration_minutes ? `${session.duration_minutes}m` : '—'}
                  </span>
                </div>
                <div style={styles.stat}>
                  <span style={styles.statLabel}>Energy</span>
                  <span style={styles.statValue}>{'⚡'.repeat(session.energy_level || 0)}</span>
                </div>
                <div style={styles.stat}>
                  <span style={styles.statLabel}>Focus</span>
                  <span style={styles.statValue}>
                    {session.distraction_level <= 2 ? '🎯 High' : session.distraction_level <= 3 ? '😐 Medium' : '😵 Low'}
                  </span>
                </div>
                <div style={styles.stat}>
                  <span style={styles.statLabel}>Score</span>
                  <span style={styles.statValue}>{renderScore(session.productivity_score)}</span>
                </div>
              </div>

              {session.tags && session.tags.length > 0 && (
                <div style={styles.tagsRow}>
                  {session.tags.map(tag => (
                    <span key={tag} style={styles.tag}>#{tag}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const styles = {
  container: { padding: '32px', maxWidth: '800px', margin: '0 auto' },
  heading: { color: '#ffffff', fontSize: '20px', fontWeight: '700', marginBottom: '8px' },
  subtext: { color: '#888', fontSize: '14px', marginBottom: '20px' },
  inputCard: { background: '#1a1a24', borderRadius: '12px', padding: '20px', border: '1px solid #2a2a3a' },
  textarea: { width: '100%', background: '#0f0f13', border: '1px solid #2a2a3a', borderRadius: '8px', color: '#fff', fontSize: '14px', padding: '14px', resize: 'vertical', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', lineHeight: '1.6' },
  inputFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' },
  charCount: { color: '#555', fontSize: '12px' },
  button: { padding: '10px 20px', background: '#6c63ff', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' },
  error: { color: '#ff6b6b', fontSize: '13px', marginTop: '8px' },
  emptyState: { textAlign: 'center', padding: '60px 20px', color: '#888', background: '#1a1a24', borderRadius: '12px', border: '1px solid #2a2a3a' },
  sessionList: { display: 'flex', flexDirection: 'column', gap: '16px' },
  sessionCard: { background: '#1a1a24', borderRadius: '12px', padding: '20px', border: '1px solid #2a2a3a' },
  sessionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  sessionMeta: { display: 'flex', alignItems: 'center', gap: '12px' },
  taskBadge: { padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', color: '#fff' },
  sessionDate: { color: '#666', fontSize: '12px' },
  deleteBtn: { background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: '14px', padding: '4px 8px', borderRadius: '4px' },
  summary: { color: '#ccc', fontSize: '14px', lineHeight: '1.6', marginBottom: '16px' },
  statsRow: { display: 'flex', gap: '24px', marginBottom: '12px' },
  stat: { display: 'flex', flexDirection: 'column', gap: '4px' },
  statLabel: { color: '#666', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' },
  statValue: { color: '#fff', fontSize: '14px', fontWeight: '600' },
  tagsRow: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  tag: { background: '#2a2a3a', color: '#888', fontSize: '12px', padding: '3px 10px', borderRadius: '12px' }
}