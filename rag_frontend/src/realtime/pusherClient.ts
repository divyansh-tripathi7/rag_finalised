import Pusher from 'pusher-js'

const key = import.meta.env.VITE_PUSHER_KEY
const cluster = import.meta.env.VITE_PUSHER_CLUSTER

export function createPusherClient() {
  if (!key || !cluster) {
    return null
  }

  return new Pusher(key, {
    cluster,
    forceTLS: true,
  })
}

export function expertChannelName(expertName: string) {
  const base = expertName.toLowerCase()
  const safe = base
    .split('')
    .map((ch) => {
      if (/[a-z0-9]/.test(ch)) return ch
      if (ch === ' ' || ch === '-' || ch === '_') return '-'
      return ''
    })
    .join('')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  return `expert-chat-${safe || 'unknown'}`
}

