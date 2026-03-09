import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'

type Expert = Record<string, unknown>

interface AskResponse {
  query: string
  expanded_query: string
  retrieved_experts: Expert[]
  llm_recommendation: string
  latency: number
}

const API_BASE = 'http://127.0.0.1:8000'

export function ChatPage() {
  const [query, setQuery] = useState(
    'What are the best sustainable irrigation practices for wheat farming?',
  )
  const [response, setResponse] = useState<AskResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`${API_BASE}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })

      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`)
      }

      const data: AskResponse = await res.json()
      setResponse(data)
    } catch (err) {
      console.error(err)
      setError('Something went wrong while fetching the answer.')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenExpert = (expert: Expert) => {
    navigate('/expert', { state: { expert } })
  }

  const experts = response?.retrieved_experts ?? []

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="brand">
          <div className="brand-logo">A</div>
          <div className="brand-text">
            <div className="brand-title">AgriMentor AI</div>
            <div className="brand-subtitle">Expert Referral System</div>
          </div>
          <span className="badge-prototype">Prototype</span>
        </div>
        <button className="header-button">About</button>
      </header>

      <main className="app-main">
        <section className="chat-card">
          <header className="chat-card-header">
            <h1>Ask a Question</h1>
            <p>Get AI-powered answers with expert recommendations</p>
          </header>

          <form className="question-form" onSubmit={handleSubmit}>
            <label className="question-label" htmlFor="question-input">
              AI Answer
            </label>
            <div className="question-input-row">
              <input
                id="question-input"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type your question here..."
              />
              <button
                type="submit"
                className="ask-button"
                disabled={loading}
              >
                {loading ? 'Asking...' : 'Ask'}
              </button>
            </div>
          </form>

          <section className="answer-section">
            <div className="section-title-row">
              <h2>AI Answer</h2>
              {response && (
                <span className="latency-pill">
                  {response.latency.toFixed(2)}s
                </span>
              )}
            </div>
            <div className="answer-body">
              {error && <p className="error-text">{error}</p>}
              {!error && response && (
                <ReactMarkdown>{response.llm_recommendation}</ReactMarkdown>
              )}
              {!error && !response && (
                <p className="placeholder-text">
                  Your detailed AI answer will appear here after you ask a
                  question.
                </p>
              )}
            </div>
          </section>

          <section className="experts-section">
            <h3>Recommended Experts</h3>
            {experts.length === 0 && (
              <p className="placeholder-text">
                Top recommended experts will appear here.
              </p>
            )}
            <ul className="experts-list">
              {experts.map((expert, index) => {
                const name =
                  (expert['Manager_Name'] as string | undefined) ??
                  (expert['Name'] as string | undefined) ??
                  `Expert ${index + 1}`
                const roleSnippet =
                  (expert['Role_Experience'] as string | undefined) ?? ''
                const snippet =
                  roleSnippet.length > 160
                    ? `${roleSnippet.slice(0, 160)}…`
                    : roleSnippet

                const initials = name
                  .split(' ')
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((part) => part[0])
                  .join('')
                  .toUpperCase()

                return (
                  <li key={index} className="expert-row">
                    <div className="expert-main">
                      <div className="avatar-circle">{initials}</div>
                      <div className="expert-text">
                        <button
                          type="button"
                          className="expert-name-button"
                          onClick={() => handleOpenExpert(expert)}
                        >
                          {name}
                        </button>
                        {snippet && (
                          <div className="expert-snippet">{snippet}</div>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="expert-arrow-button"
                      onClick={() => handleOpenExpert(expert)}
                    >
                      &gt;
                    </button>
                  </li>
                )
              })}
            </ul>
          </section>

          <footer className="chat-footer">
            <span>Powered by AgriMentor AI</span>
            <span className="prototype-label">Prototype v1.0</span>
          </footer>
        </section>
      </main>
    </div>
  )
}

