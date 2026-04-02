import { useState, useEffect, useRef } from 'react'
import { getStarterPrompts, sendMessage } from '../api/insights'
import ReactMarkdown from 'react-markdown'

export default function Insights() {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('chat_history')
    return saved ? JSON.parse(saved) : []
  })
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [starters, setStarters] = useState([])
  const bottomRef = useRef(null)

  useEffect(() => {
    getStarterPrompts()
      .then(res => setStarters(res.data.prompts))
      .catch(() => {})
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    localStorage.setItem('chat_history', JSON.stringify(messages))
  }, [messages])

  const handleSend = async (text) => {
    const messageText = text || input.trim()
    if (!messageText || loading) return

    const userMessage = { role: 'user', content: messageText }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setLoading(true)

    try {
      const history = updatedMessages.slice(-6)
      const res = await sendMessage(messageText, history)
      setMessages([...updatedMessages, { role: 'assistant', content: res.data.reply }])
    } catch (err) {
      const detail = err.response?.data?.detail
      if (detail?.error === 'pro_required') {
        setMessages([...updatedMessages, {
          role: 'assistant',
          content: '🔒 The AI Productivity Assistant is a Pro feature. Go to Settings and upgrade your plan to unlock it.'
        }])
      } else {
        setMessages([...updatedMessages, {
          role: 'assistant',
          content: 'Something went wrong. Please try again.'
        }])
      }
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div style={styles.container}>
      <div style={{ ...styles.header, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={styles.title}>Personal Productivity Assistant</h2>
          <p style={styles.subtitle}>
            Ask me anything about your productivity patterns. I have access to all your session data.
          </p>
        </div>
        {messages.length > 0 && (
          <button
            style={styles.clearBtn}
            onClick={() => {
              setMessages([])
              localStorage.removeItem('chat_history')
            }}
          >
            Clear conversation
          </button>
        )}
      </div>

      {messages.length === 0 && (
        <div style={styles.startersSection}>
          <p style={styles.startersLabel}>Suggested questions</p>
          <div style={styles.starters}>
            {starters.map((prompt, i) => (
              <button
                key={i}
                style={styles.starterBtn}
                onClick={() => handleSend(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={styles.chatWindow}>
        {messages.length === 0 && (
          <div style={styles.emptyChat}>
            <p>👆 Pick a question above or type your own below</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              ...styles.message,
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              background: msg.role === 'user' ? '#6c63ff' : '#1a1a24',
              border: msg.role === 'assistant' ? '1px solid #2a2a3a' : 'none',
              maxWidth: msg.role === 'user' ? '70%' : '85%'
            }}
          >
            {msg.role === 'assistant' && (
              <p style={styles.assistantLabel}>🤖 Assistant</p>
            )}
            <div style={styles.messageText} className="markdown-body">
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ ...styles.message, background: '#1a1a24', border: '1px solid #2a2a3a', alignSelf: 'flex-start' }}>
            <p style={styles.assistantLabel}>🤖 Assistant</p>
            <p style={{ ...styles.messageText, color: '#666' }}>Analyzing your data...</p>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div style={styles.inputRow}>
        <textarea
          style={styles.input}
          placeholder="Ask about your productivity patterns..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          disabled={loading}
        />
        <button
          style={{ ...styles.sendBtn, opacity: loading || !input.trim() ? 0.5 : 1 }}
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
        >
          Send
        </button>
      </div>
      <p style={styles.hint}>Press Enter to send, Shift+Enter for new line</p>
    </div>
  )
}

const styles = {
  container: { padding: '32px', maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' },
  header: { marginBottom: '24px' },
  title: { color: '#fff', fontSize: '20px', fontWeight: '700', margin: '0 0 8px 0' },
  subtitle: { color: '#888', fontSize: '14px', margin: 0 },
  clearBtn: { background: 'none', border: '1px solid #2a2a3a', color: '#666', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', whiteSpace: 'nowrap' },
  startersSection: { marginBottom: '24px' },
  startersLabel: { color: '#666', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' },
  starters: { display: 'flex', flexDirection: 'column', gap: '8px' },
  starterBtn: { background: '#1a1a24', border: '1px solid #2a2a3a', color: '#aaa', padding: '12px 16px', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', fontSize: '14px' },
  chatWindow: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '16px', padding: '4px 0' },
  emptyChat: { textAlign: 'center', color: '#555', fontSize: '14px', margin: 'auto' },
  message: { padding: '14px 16px', borderRadius: '12px' },
  assistantLabel: { color: '#6c63ff', fontSize: '11px', fontWeight: '600', margin: '0 0 6px 0', textTransform: 'uppercase', letterSpacing: '0.5px' },
  messageText: { color: '#e0e0e0', fontSize: '14px', lineHeight: '1.6', margin: 0 },
  inputRow: { display: 'flex', gap: '12px', alignItems: 'flex-end' },
  input: { flex: 1, background: '#1a1a24', border: '1px solid #2a2a3a', borderRadius: '8px', color: '#fff', fontSize: '14px', padding: '12px 14px', resize: 'none', outline: 'none', fontFamily: 'inherit' },
  sendBtn: { padding: '12px 24px', background: '#6c63ff', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', whiteSpace: 'nowrap' },
  hint: { color: '#444', fontSize: '11px', marginTop: '8px' }
}