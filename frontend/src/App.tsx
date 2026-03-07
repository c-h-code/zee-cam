import { useState, useEffect, useCallback } from 'react'
import './App.css'

const API_BASE = 'http://127.0.0.1:8000'
const TOKEN_KEY = 'zeecam_token'

// ---------------------------------------------------------------------------
// Auth helpers
// ---------------------------------------------------------------------------

function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

function apiFetch(path: string, init: RequestInit = {}) {
  const token = getToken()
  return fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...init.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Video {
  id: string
  created_at: string | number
  video_url: string
  thumbnail_url: string
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function formatDate(value: string | number): string {
  const ms = typeof value === 'number' || /^\d+$/.test(value)
    ? Number(value) * 1000
    : Date.parse(value)
  return new Date(ms).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ---------------------------------------------------------------------------
// Login page
// ---------------------------------------------------------------------------

function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      if (res.status === 401) {
        setError('Incorrect password.')
        return
      }
      if (!res.ok) throw new Error()
      const { token } = await res.json()
      setToken(token)
      onLogin()
    } catch {
      setError('Could not reach the server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-screen">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-logo">
          <span className="logo-dot" />
          ZeeCam
        </div>
        <div className="login-field">
          <label className="login-label" htmlFor="username">Username</label>
          <input
            id="username"
            className="login-input"
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            autoFocus
            autoComplete="username"
          />
        </div>
        <div className="login-field">
          <label className="login-label" htmlFor="password">Password</label>
          <input
            id="password"
            className="login-input"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        {error && <p className="login-error">{error}</p>}
        <button className="login-submit" type="submit" disabled={loading || !username || !password}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Video modal
// ---------------------------------------------------------------------------

function VideoModal({ video, onClose, onDelete, onUnauth }: {
  video: Video
  onClose: () => void
  onDelete: (id: string) => void
  onUnauth: () => void
}) {
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res = await apiFetch(`/videos/${video.id}`, { method: 'DELETE' })
      if (res.status === 401) { onUnauth(); return }
      if (!res.ok) throw new Error()
      onDelete(video.id)
      onClose()
    } catch {
      setDeleting(false)
      setConfirming(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <video className="modal-video" src={video.video_url} controls autoPlay />
        <div className="modal-footer">
          <span className="modal-timestamp">{formatDate(video.created_at)}</span>
          {!confirming ? (
            <button className="btn-delete" onClick={() => setConfirming(true)}>
              Delete
            </button>
          ) : (
            <div className="confirm-row">
              <span>Are you sure?</span>
              <button className="btn-delete" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting…' : 'Yes, delete'}
              </button>
              <button className="btn-cancel" onClick={() => setConfirming(false)}>
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Video card
// ---------------------------------------------------------------------------

function VideoCard({ video, onClick }: { video: Video; onClick: () => void }) {
  return (
    <button className="video-card" onClick={onClick}>
      <div className="thumbnail-wrap">
        <img
          className="thumbnail"
          src={video.thumbnail_url}
          alt={`Recording ${video.id}`}
          loading="lazy"
        />
        <div className="play-icon">▶</div>
      </div>
      <div className="card-footer">
        <span className="card-timestamp">{formatDate(video.created_at)}</span>
      </div>
    </button>
  )
}

// ---------------------------------------------------------------------------
// Settings page
// ---------------------------------------------------------------------------

function SettingsPage({ onUnauth, onLogout }: { onUnauth: () => void; onLogout: () => void }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleToggleUpload = async () => {
    setStatus('loading')
    try {
      // TODO: implement POST /upload/disable endpoint
      const res = await apiFetch('/upload/disable', { method: 'POST' })
      if (res.status === 401) { onUnauth(); return }
      if (!res.ok) throw new Error()
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return (
    <main className="main">
      <div className="settings-page">
        <h2 className="settings-title">Settings</h2>
        <div className="settings-section">
          <div className="settings-row">
            <div>
              <div className="setting-label">Camera Upload</div>
              <div className="setting-desc">Stop the camera from uploading new recordings</div>
            </div>
            <button
              className="btn-danger"
              onClick={handleToggleUpload}
              disabled={status === 'loading' || status === 'success'}
            >
              {status === 'loading' && 'Working…'}
              {status === 'success' && 'Upload disabled'}
              {status === 'error' && 'Failed — retry'}
              {status === 'idle' && 'Disable upload'}
            </button>
          </div>
          {status === 'error' && (
            <p className="setting-error">Could not reach the server.</p>
          )}
        </div>

        <div className="settings-section" style={{ marginTop: '1rem' }}>
          <div className="settings-row">
            <div>
              <div className="setting-label">Session</div>
              <div className="setting-desc">Sign out of ZeeCam</div>
            </div>
            <button className="btn-cancel" onClick={onLogout}>Sign out</button>
          </div>
        </div>
      </div>
    </main>
  )
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

export default function App() {
  const [authed, setAuthed] = useState(() => !!getToken())
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<Video | null>(null)
  const [page, setPage] = useState<'videos' | 'settings'>('videos')

  const handleUnauth = useCallback(() => {
    clearToken()
    setAuthed(false)
  }, [])

  const handleLogout = () => {
    clearToken()
    setAuthed(false)
  }

  const fetchVideos = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiFetch('/videos')
      if (res.status === 401) { handleUnauth(); return }
      if (!res.ok) throw new Error(`Server error: ${res.status}`)
      const data: Video[] = await res.json()
      setVideos(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load videos')
    } finally {
      setLoading(false)
    }
  }, [handleUnauth])

  useEffect(() => {
    if (authed) fetchVideos()
  }, [authed, fetchVideos])

  if (!authed) {
    return <LoginPage onLogin={() => setAuthed(true)} />
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <button className="logo logo-btn" onClick={() => setPage('videos')}>
            <span className="logo-dot" />
            ZeeCam
          </button>
          <div className="header-actions">
            {page === 'videos' && (
              <button className="btn-refresh" onClick={fetchVideos} disabled={loading}>
                {loading ? 'Loading…' : 'Refresh'}
              </button>
            )}
            <button
              className={`btn-icon ${page === 'settings' ? 'btn-icon--active' : ''}`}
              onClick={() => setPage(p => p === 'settings' ? 'videos' : 'settings')}
              title="Settings"
            >
              ⚙
            </button>
          </div>
        </div>
      </header>

      {page === 'settings' ? (
        <SettingsPage onUnauth={handleUnauth} onLogout={handleLogout} />
      ) : (
        <main className="main">
          {loading && videos.length === 0 && (
            <div className="state-msg">Loading recordings…</div>
          )}
          {error && (
            <div className="state-msg error">
              {error}
              <button className="btn-retry" onClick={fetchVideos}>Retry</button>
            </div>
          )}
          {!loading && !error && videos.length === 0 && (
            <div className="state-msg">No recordings found.</div>
          )}
          <div className="grid">
            {videos.map(video => (
              <VideoCard
                key={video.id}
                video={video}
                onClick={() => setSelected(video)}
              />
            ))}
          </div>
        </main>
      )}

      {selected && (
        <VideoModal
          video={selected}
          onClose={() => setSelected(null)}
          onDelete={id => setVideos(prev => prev.filter(v => v.id !== id))}
          onUnauth={handleUnauth}
        />
      )}
    </div>
  )
}
