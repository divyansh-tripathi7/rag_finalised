import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { createPusherClient, expertChannelName } from '../realtime/pusherClient'

interface ChatMessage {
  from_user: string
  text: string
}

const API_BASE = 'http://127.0.0.1:8000'

export function ExpertConsolePage() {
  const [searchParams] = useSearchParams()

  const initialExpert = searchParams.get('expert') ?? ''
  const initialName = searchParams.get('name') ?? 'Expert'

  const [expertName, setExpertName] = useState(initialExpert)
  const [displayName, setDisplayName] = useState(initialName)
  const [connected, setConnected] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')

  const channelName = useMemo(
    () => (expertName ? expertChannelName(expertName) : ''),
    [expertName],
  )

  useEffect(() => {
    if (!connected || !channelName) return

    const client = createPusherClient()
    if (!client) return

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
  }, [connected, channelName])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || !expertName) return
    setInput('')

    try {
      const res = await fetch(`${API_BASE}/realtime/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expert_name: expertName,
          from_user: displayName || 'Expert',
          text,
        }),
      })

      if (!res.ok) {
        throw new Error(`Failed with status ${res.status}`)
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { from_user: displayName || 'Expert', text },
      ])
    }
  }

  return (
    <div className="app-root">
      <main className="app-main">
        <section className="profile-card">
          <header className="profile-header">
            <div className="profile-main">
              <div className="profile-text">
                <h1>Expert Console</h1>
                <p className="profile-location">
                  Real-time messages for a single expert channel.
                </p>
              </div>
            </div>
          </header>

          <section className="profile-body">
            <div className="profile-left">
              <h2>Connection Settings</h2>
              <div className="contact-options">
                <div className="contact-options-row">
                  <input
                    type="text"
                    placeholder="Expert name (must match profile)"
                    value={expertName}
                    onChange={(e) => setExpertName(e.target.value)}
                    className="chat-input-expert"
                  />
                  <input
                    type="text"
                    placeholder="Your display name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="chat-input-expert"
                  />
                  <button
                    type="button"
                    className="primary-pill"
                    onClick={() => setConnected(true)}
                    disabled={!expertName}
                  >
                    Join Channel
                  </button>
                </div>
                {channelName && connected && (
                  <p className="placeholder-text">
                    Subscribed to channel <strong>{channelName}</strong>
                  </p>
                )}
              </div>

              <div className="chat-panel">
                <h4>Messages</h4>
                <div className="chat-messages">
                  {messages.length === 0 && (
                    <p className="placeholder-text">
                      Waiting for messages on this channel.
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
                    placeholder="Type a reply..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSend()
                    }}
                  />
                  <button
                    type="button"
                    className="ask-button"
                    onClick={handleSend}
                    disabled={!connected || !expertName}
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </section>
        </section>
      </main>
    </div>
  )
}

