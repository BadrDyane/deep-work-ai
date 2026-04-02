import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { completeOnboarding } from '../api/onboarding'
import { useAuth } from '../context/AuthContext'

const WORK_TYPES = [
  'Software Development',
  'Design & Creative',
  'Writing & Content',
  'Research & Analysis',
  'Management & Strategy',
  'Sales & Marketing',
  'Other'
]

export default function Onboarding() {
  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    work_type: '',
    daily_focus_goal: 4,
    improve_focus: false,
    improve_consistency: false,
    improve_energy: false
  })

  const handleComplete = async () => {
    setLoading(true)
    setError('')
    try {
      await completeOnboarding(form)
      await refreshUser()
      navigate('/dashboard')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Progress indicator */}
        <div style={styles.progressRow}>
          {[1, 2, 3].map(n => (
            <div key={n} style={{
              ...styles.progressDot,
              background: n <= step ? '#6c63ff' : '#2a2a3a'
            }} />
          ))}
        </div>

        {step === 1 && (
          <div>
            <h2 style={styles.stepTitle}>Welcome to Deep Work AI 👋</h2>
            <p style={styles.stepSubtitle}>Let's personalize your experience. What kind of work do you do?</p>
            <div style={styles.optionGrid}>
              {WORK_TYPES.map(type => (
                <button
                  key={type}
                  style={{
                    ...styles.optionBtn,
                    border: form.work_type === type ? '1px solid #6c63ff' : '1px solid #2a2a3a',
                    color: form.work_type === type ? '#fff' : '#888',
                    background: form.work_type === type ? '#1a1a3a' : '#0f0f13'
                  }}
                  onClick={() => setForm({ ...form, work_type: type })}
                >
                  {type}
                </button>
              ))}
            </div>
            <button
              style={{ ...styles.nextBtn, opacity: !form.work_type ? 0.5 : 1 }}
              disabled={!form.work_type}
              onClick={() => setStep(2)}
            >
              Next →
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 style={styles.stepTitle}>Set your daily focus goal</h2>
            <p style={styles.stepSubtitle}>How many hours of focused work do you aim for each day?</p>
            <div style={styles.sliderContainer}>
              <span style={styles.sliderValue}>{form.daily_focus_goal} hours</span>
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={form.daily_focus_goal}
                onChange={e => setForm({ ...form, daily_focus_goal: parseFloat(e.target.value) })}
                style={styles.slider}
              />
              <div style={styles.sliderLabels}>
                <span>1 hr</span>
                <span>10 hrs</span>
              </div>
            </div>
            <div style={styles.btnRow}>
              <button style={styles.backBtn} onClick={() => setStep(1)}>← Back</button>
              <button style={styles.nextBtn} onClick={() => setStep(3)}>Next →</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 style={styles.stepTitle}>What do you want to improve?</h2>
            <p style={styles.stepSubtitle}>Select all that apply. This helps personalize your AI assistant.</p>
            <div style={styles.checkboxList}>
              {[
                { key: 'improve_focus', label: '🎯 Deep focus and flow state' },
                { key: 'improve_consistency', label: '📅 Daily consistency and streaks' },
                { key: 'improve_energy', label: '⚡ Managing energy levels' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  style={{
                    ...styles.checkboxBtn,
                    border: form[key] ? '1px solid #6c63ff' : '1px solid #2a2a3a',
                    background: form[key] ? '#1a1a3a' : '#0f0f13',
                    color: form[key] ? '#fff' : '#888'
                  }}
                  onClick={() => setForm({ ...form, [key]: !form[key] })}
                >
                  <span style={styles.checkmark}>{form[key] ? '✓' : '○'}</span>
                  {label}
                </button>
              ))}
            </div>
            {error && <p style={styles.error}>{error}</p>}
            <div style={styles.btnRow}>
              <button style={styles.backBtn} onClick={() => setStep(2)}>← Back</button>
              <button
                style={{ ...styles.nextBtn, opacity: loading ? 0.6 : 1 }}
                onClick={handleComplete}
                disabled={loading}
              >
                {loading ? 'Setting up...' : 'Get Started 🚀'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', background: '#0f0f13', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  card: { background: '#1a1a24', border: '1px solid #2a2a3a', borderRadius: '16px', padding: '40px', width: '100%', maxWidth: '480px' },
  progressRow: { display: 'flex', gap: '8px', marginBottom: '32px' },
  progressDot: { height: '4px', flex: 1, borderRadius: '2px', transition: 'background 0.3s' },
  stepTitle: { color: '#fff', fontSize: '20px', fontWeight: '700', margin: '0 0 8px 0' },
  stepSubtitle: { color: '#888', fontSize: '14px', margin: '0 0 24px 0' },
  optionGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px' },
  optionBtn: { padding: '12px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500', transition: 'all 0.2s', textAlign: 'left' },
  sliderContainer: { marginBottom: '24px' },
  sliderValue: { color: '#6c63ff', fontSize: '32px', fontWeight: '700', display: 'block', textAlign: 'center', marginBottom: '16px' },
  slider: { width: '100%', accentColor: '#6c63ff' },
  sliderLabels: { display: 'flex', justifyContent: 'space-between', color: '#666', fontSize: '12px', marginTop: '8px' },
  checkboxList: { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' },
  checkboxBtn: { padding: '14px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.2s', textAlign: 'left' },
  checkmark: { fontSize: '16px', color: '#6c63ff' },
  btnRow: { display: 'flex', gap: '12px' },
  nextBtn: { flex: 1, padding: '12px', background: '#6c63ff', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '15px' },
  backBtn: { padding: '12px 20px', background: 'none', color: '#888', border: '1px solid #2a2a3a', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  error: { color: '#ef4444', fontSize: '13px', marginBottom: '12px' }
}