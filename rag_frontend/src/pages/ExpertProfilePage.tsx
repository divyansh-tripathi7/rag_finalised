import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { createPusherClient, expertChannelName } from '../realtime/pusherClient'

type Expert = Record<string, unknown>

interface LocationState {
  expert?: Expert
}

interface ChatMessage {
  from_user: string
  text: string
}

const API_BASE = 'http://127.0.0.1:8000'

export function ExpertProfilePage() {
  const navigate = useNavigate()
  const { state } = useLocation() as { state: LocationState | null }
  const expert = state?.expert

  const [showContactOptions, setShowContactOptions] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')

  if (!expert) {
    return (
      <div className="app-root">
        <main className="app-main">
          <section className="profile-card">
            <p className="placeholder-text">
              No expert data available. Please go back and select an expert from
              the recommendations list.
            </p>
            <button
              type="button"
              className="ask-button"
              onClick={() => navigate('/')}
            >
              Back to Ask a Question
            </button>
          </section>
        </main>
      </div>
    )
  }

  const name =
    (expert['Manager_Name'] as string | undefined) ??
    (expert['Name'] as string | undefined) ??
    'Expert'
  const role =
    (expert['Designation'] as string | undefined) ??
    (expert['Role'] as string | undefined) ??
    'Subject Matter Expert'
  const location =
    (expert['Location'] as string | undefined) ??
    (expert['City'] as string | undefined) ??
    (expert['Region'] as string | undefined) ??
    'Location not specified'
  const experience =
    (expert['Experience_Years'] as string | undefined) ??
    (expert['Total_Experience'] as string | undefined) ??
    ''
  const summary =
    (expert['Summary'] as string | undefined) ??
    (expert['Role_Experience'] as string | undefined) ??
    ''

  const email = (expert['Email'] as string | undefined) ?? ''
  const phone = (expert['Phone'] as string | undefined) ?? ''
  const linkedin = (expert['LinkedIn'] as string | undefined) ?? ''

  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

  useEffect(() => {
    if (!showChat) return

    const client = createPusherClient()
    if (!client) return

    const channelName = expertChannelName(name)
    const channel = client.subscribe(channelName)

    const handler = (data: ChatMessage) => {
      setMessages((prev) => [...prev, data])
    }

    channel.bind('new-message', handler)

    return () => {
      channel.unbind('new-message', handler)
      client.unsubscribe(channelName)
      client.disconnect()
    }
  }, [showChat, name])

  const handleSendMessage = async () => {
    const text = input.trim()
    if (!text) return

    setInput('')

    try {
      const res = await fetch(`${API_BASE}/realtime/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expert_name: name,
          from_user: 'You',
          text,
        }),
      })

      if (!res.ok) {
        throw new Error(`Failed with status ${res.status}`)
      }
    } catch {
      // Fallback: append locally even if backend fails
      setMessages((prev) => [...prev, { from_user: 'You', text }])
    }
  }

  return (
    <div className="app-root">
      <main className="app-main">
        <section className="profile-card">
          <header className="profile-header">
            <div className="profile-main">
              <div className="avatar-large">{initials}</div>
              <div className="profile-text">
                <h1>{name}</h1>
                <p className="profile-role">{role}</p>
                <p className="profile-location">{location}</p>
                {experience && (
                  <div className="experience-badge">
                    {experience} Years Experience
                  </div>
                )}
              </div>
            </div>
            <div className="profile-actions">
              <button
                type="button"
                className="primary-pill"
                onClick={() => setShowContactOptions((v) => !v)}
              >
                Contact Expert
              </button>
              <button
                type="button"
                className="secondary-pill"
                onClick={() => navigate(-1)}
              >
                Back to Results
              </button>
            </div>
          </header>

          <section className="profile-body">
            <div className="profile-left">
              <h2>About This Expert</h2>
              {summary ? (
                <p className="profile-summary">{summary}</p>
              ) : (
                <p className="placeholder-text">
                  No detailed biography available for this expert.
                </p>
              )}

              <h3>Expertise</h3>
              <ul className="expertise-list">
                <li>Domain knowledge derived from Role_Experience.</li>
                <li>Specialization fields from the expert metadata.</li>
                <li>Advisory and consultation for relevant projects.</li>
              </ul>

              {showContactOptions && (
                <div className="contact-options">
                  <h3>How would you like to connect?</h3>
                  <div className="contact-options-row">
                    <button
                      type="button"
                      className="secondary-pill"
                      // Placeholder for your future meeting scheduler
                      onClick={() => undefined}
                    >
                      Schedule a Meeting
                    </button>
                    <button
                      type="button"
                      className="primary-pill"
                      onClick={() => setShowChat(true)}
                    >
                      Message in App
                    </button>
                  </div>

                  {showChat && (
                    <div className="chat-panel">
                      <h4>Messages with {name}</h4>
                      <div className="chat-messages">
                        {messages.length === 0 && (
                          <p className="placeholder-text">
                            Start the conversation by sending a message.
                          </p>
                        )}
                        {messages.map((m, idx) => (
                          <div key={idx} className="chat-message">
                            <span className="chat-from">{m.from_user}:</span>
                            <span className="chat-text">{m.text}</span>
                          </div>
                        ))}
                      </div>
                      <div className="chat-input-row">
                        <input
                          type="text"
                          placeholder="Type your message..."
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSendMessage()
                          }}
                        />
                        <button
                          type="button"
                          className="ask-button"
                          onClick={handleSendMessage}
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <aside className="profile-right">
              <h3>Contact & Links</h3>
              <ul className="contact-list">
                {email && (
                  <li>
                    <span>Email</span>
                    <a href={`mailto:${email}`}>{email}</a>
                  </li>
                )}
                {phone && (
                  <li>
                    <span>Phone</span>
                    <span>{phone}</span>
                  </li>
                )}
                {linkedin && (
                  <li>
                    <span>LinkedIn</span>
                    <a href={linkedin} target="_blank" rel="noreferrer">
                      View profile
                    </a>
                  </li>
                )}
                {!email && !phone && !linkedin && (
                  <li>
                    <span>Details</span>
                    <span>Contact information is not available.</span>
                  </li>
                )}
              </ul>
            </aside>
          </section>
        </section>
      </main>
    </div>
  )
}

