import { useState, useEffect } from 'react'
import { generateReport, getReports } from '../api/reports'

export default function Reports() {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getReports()
      .then(res => {
        if (res.data.length > 0) setReport(res.data[0])
      })
      .catch(() => {})
      .finally(() => setFetching(false))
  }, [])

  const handleGenerate = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await generateReport()
      setReport(res.data)
    } catch {
      setError('Failed to generate report. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Weekly Brief</h2>
          <p style={styles.subtitle}>
            An honest AI-generated breakdown of your week — what you accomplished, where time leaked, and what to do next.
          </p>
        </div>
        <button
          style={{ ...styles.generateBtn, opacity: loading ? 0.6 : 1 }}
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? '⏳ Generating...' : '✨ Generate This Week\'s Brief'}
        </button>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      {fetching ? (
        <p style={styles.muted}>Loading...</p>
      ) : !report ? (
        <div style={styles.emptyState}>
          <p style={{ fontSize: '32px', margin: '0 0 16px 0' }}>📋</p>
          <p style={{ color: '#fff', fontWeight: '600', marginBottom: '8px' }}>No brief generated yet</p>
          <p style={{ color: '#666', fontSize: '14px' }}>
            Click the button above to generate your first weekly productivity brief.
          </p>
        </div>
      ) : (
        <div>
          {/* Report metadata */}
          <div style={styles.metaRow}>
            <span style={styles.metaBadge}>
              Week of {formatDate(report.week_start)}
            </span>
            <div style={styles.metaStats}>
              <span style={styles.metaStat}>{report.total_sessions} sessions</span>
              <span style={styles.metaStat}>{Math.round(report.total_minutes / 60 * 10) / 10} hrs</span>
              <span style={{ ...styles.metaStat, color: report.avg_productivity_score >= 7 ? '#10b981' : report.avg_productivity_score >= 4 ? '#f59e0b' : '#ef4444' }}>
                Avg {report.avg_productivity_score}/10
              </span>
            </div>
          </div>

          {/* Three sections */}
          <BriefSection
            icon="✅"
            title="Accomplishments"
            content={report.accomplishments}
            color="#10b981"
          />
          <BriefSection
            icon="⚠️"
            title="Time Leaks"
            content={report.time_leaks}
            color="#f59e0b"
          />
          <BriefSection
            icon="🎯"
            title="Recommendations for Next Week"
            content={report.recommendations}
            color="#6c63ff"
          />

          <p style={styles.generatedAt}>
            Generated {formatDate(report.created_at)}
          </p>
        </div>
      )}
    </div>
  )
}

function BriefSection({ icon, title, content, color }) {
  return (
    <div style={styles.section}>
      <div style={styles.sectionHeader}>
        <span style={{ fontSize: '18px' }}>{icon}</span>
        <h3 style={{ ...styles.sectionTitle, color }}>{title}</h3>
      </div>
      <div style={styles.sectionContent}>
        {content ? (
          <div style={styles.sectionText} className="markdown-body">{content}</div>
        ) : (
          <p style={styles.muted}>No data available.</p>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: { padding: '32px', maxWidth: '800px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', gap: '20px' },
  title: { color: '#fff', fontSize: '20px', fontWeight: '700', margin: '0 0 8px 0' },
  subtitle: { color: '#888', fontSize: '14px', margin: 0, maxWidth: '480px' },
  generateBtn: { padding: '12px 20px', background: '#6c63ff', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', whiteSpace: 'nowrap', flexShrink: 0 },
  error: { color: '#ef4444', fontSize: '13px', marginBottom: '16px' },
  emptyState: { textAlign: 'center', padding: '80px 20px', background: '#1a1a24', borderRadius: '12px', border: '1px solid #2a2a3a' },
  metaRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  metaBadge: { background: '#1a1a24', border: '1px solid #2a2a3a', color: '#888', fontSize: '13px', padding: '6px 12px', borderRadius: '20px' },
  metaStats: { display: 'flex', gap: '16px' },
  metaStat: { color: '#fff', fontSize: '14px', fontWeight: '600' },
  section: { background: '#1a1a24', border: '1px solid #2a2a3a', borderRadius: '12px', padding: '24px', marginBottom: '16px' },
  sectionHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' },
  sectionTitle: { fontSize: '16px', fontWeight: '700', margin: 0 },
  sectionContent: {},
  sectionText: { color: '#ccc', fontSize: '14px', lineHeight: '1.8', margin: 0, whiteSpace: 'pre-wrap' },
  muted: { color: '#555', fontSize: '13px' },
  generatedAt: { color: '#444', fontSize: '12px', textAlign: 'right', marginTop: '8px' }
}