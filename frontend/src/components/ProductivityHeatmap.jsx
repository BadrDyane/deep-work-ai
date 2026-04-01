import CalendarHeatmap from 'react-calendar-heatmap'
import 'react-calendar-heatmap/dist/styles.css'

export default function ProductivityHeatmap({ data }) {
  const today = new Date()
  const startDate = new Date()
  startDate.setDate(today.getDate() - 90)

  // Map scores to intensity levels for color coding
  const getClassForValue = (value) => {
    if (!value || value.avg_score === 0) return 'color-empty'
    if (value.avg_score >= 8) return 'color-scale-4'
    if (value.avg_score >= 6) return 'color-scale-3'
    if (value.avg_score >= 4) return 'color-scale-2'
    return 'color-scale-1'
  }

  const getTooltip = (value) => {
    if (!value || !value.date) return 'No data'
    if (value.avg_score === 0) return `${value.date}: No sessions`
    return `${value.date}: ${value.count} session${value.count > 1 ? 's' : ''}, avg score ${value.avg_score}`
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Productivity Heatmap</h3>
        <div style={styles.legend}>
          <span style={styles.legendLabel}>Less</span>
          {['#2a2a3a', '#4a3f8a', '#6c63ff99', '#6c63ff', '#8b5cf6'].map((color, i) => (
            <div key={i} style={{ ...styles.legendBox, background: color }} />
          ))}
          <span style={styles.legendLabel}>More</span>
        </div>
      </div>

      <style>{`
        .react-calendar-heatmap .color-empty { fill: #2a2a3a; }
        .react-calendar-heatmap .color-scale-1 { fill: #4a3f8a; }
        .react-calendar-heatmap .color-scale-2 { fill: #6c63ff99; }
        .react-calendar-heatmap .color-scale-3 { fill: #6c63ff; }
        .react-calendar-heatmap .color-scale-4 { fill: #8b5cf6; }
        .react-calendar-heatmap text { fill: #666; font-size: 9px; }
      `}</style>

      <CalendarHeatmap
        startDate={startDate}
        endDate={today}
        values={data}
        classForValue={getClassForValue}
        titleForValue={getTooltip}
        showWeekdayLabels={true}
      />

      <p style={styles.caption}>
        Color intensity reflects average productivity score — not just session count.
      </p>
    </div>
  )
}

const styles = {
  container: { background: '#1a1a24', borderRadius: '12px', padding: '24px', border: '1px solid #2a2a3a' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  title: { color: '#fff', fontSize: '16px', fontWeight: '600', margin: 0 },
  legend: { display: 'flex', alignItems: 'center', gap: '4px' },
  legendLabel: { color: '#666', fontSize: '11px' },
  legendBox: { width: '12px', height: '12px', borderRadius: '2px' },
  caption: { color: '#555', fontSize: '11px', marginTop: '12px', textAlign: 'right' }
}