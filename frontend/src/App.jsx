import { useState, useRef, useEffect } from 'react'
import './App.css'

const API_BASE = import.meta.env.VITE_API_BASE

function getToken() { return localStorage.getItem('token') }
function setToken(t) { localStorage.setItem('token', t) }
function clearToken() { localStorage.removeItem('token') }

function authFetch(url, options = {}) {
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
      ...options.headers,
    },
  })
}

function formatTimestamp(unix) {
  const d = new Date(unix * 1000)
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Invalid credentials')
        return res.json()
      })
      .then((data) => {
        setToken(data.token)
        onLogin()
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }

  return (
    <div className="login-screen">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-brand">
          🐈‍⬛ ZeeCam
        </div>
        <div className="form-group">
          <label className="form-label">Username</label>
          <input
            className="form-input"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            className="form-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>
        {error && <p className="login-error">{error}</p>}
        <button className="btn btn-primary login-btn" type="submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}

function SettingsPanel({ onClose }) {
  const [uploadsEnabled, setUploadsEnabled] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    authFetch(`${API_BASE}/settings/uploads`)
      .then((res) => res.json())
      .then((data) => setUploadsEnabled(data.uploads_enabled))
      .catch(() => setUploadsEnabled(null))
  }, [])

  const toggle = () => {
    const next = !uploadsEnabled
    setSaving(true)
    authFetch(`${API_BASE}/settings/uploads`, {
      method: 'POST',
      body: JSON.stringify({ uploads_enabled: next }),
    })
      .then((res) => res.json())
      .then((data) => {
        setUploadsEnabled(data.uploads_enabled)
        setSaving(false)
      })
      .catch(() => setSaving(false))
  }

  return (
    <div className="settings-backdrop" onClick={onClose}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <span className="settings-title">Settings</span>
          <button className="btn btn-ghost btn-xs" onClick={onClose}>✕</button>
        </div>
        <div className="settings-row">
          <div className="settings-row-info">
            <span className="settings-row-label">S3 Uploads</span>
            <span className="settings-row-desc">Allow the camera to upload new footage</span>
          </div>
          <button
            className={`toggle ${uploadsEnabled ? 'toggle-on' : 'toggle-off'}`}
            onClick={toggle}
            disabled={saving || uploadsEnabled === null}
          >
            <span className="toggle-thumb" />
          </button>
        </div>
      </div>
    </div>
  )
}

function Navbar({ onSettingsOpen, onLogout }) {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        🐈‍⬛ ZeeCam
      </div>
      <div className="navbar-actions">
        <button className="btn btn-ghost" onClick={onSettingsOpen}>Settings</button>
        <button className="btn btn-ghost" onClick={onLogout}>Sign out</button>
      </div>
    </nav>
  )
}

function VideoGrid({ videos, onDelete }) {
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [confirmId, setConfirmId] = useState(null)
  const [expandedConfirm, setExpandedConfirm] = useState(false)
  const videoRef = useRef(null)

  const handleSelect = (video) => {
    setSelectedVideo(video)
    setTimeout(() => {
      if (videoRef.current) videoRef.current.play()
    }, 0)
  }

  const handleClose = () => {
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
    setSelectedVideo(null)
    setExpandedConfirm(false)
  }

  const handleDeleteClick = (e, id) => {
    e.stopPropagation()
    setConfirmId(id)
  }

  const handleConfirmDelete = (e, id) => {
    e.stopPropagation()
    setConfirmId(null)
    onDelete(id)
  }

  const handleCancelDelete = (e) => {
    e.stopPropagation()
    setConfirmId(null)
  }

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') handleClose() }
    if (selectedVideo) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedVideo])

  return (
    <>
      {selectedVideo && (
        <div className="video-expanded-backdrop" onClick={handleClose}>
          <div className="expanded-toolbar">
            <span className="expanded-timestamp">{formatTimestamp(selectedVideo.created_at)}</span>
            {expandedConfirm ? (
              <div className="delete-confirm" onClick={(e) => e.stopPropagation()}>
                <span className="confirm-label">Delete this clip?</span>
                <button className="btn btn-danger btn-xs" onClick={(e) => { e.stopPropagation(); onDelete(selectedVideo.id); handleClose() }}>Yes, delete</button>
                <button className="btn btn-ghost btn-xs" onClick={(e) => { e.stopPropagation(); setExpandedConfirm(false) }}>Cancel</button>
              </div>
            ) : (
              <div className="expanded-toolbar-actions">
                <button className="btn btn-ghost" onClick={(e) => { e.stopPropagation(); setExpandedConfirm(true) }}>🗑 Delete</button>
                <button className="btn btn-danger" onClick={handleClose}>✕ Close</button>
              </div>
            )}
          </div>
          <video
            ref={videoRef}
            src={selectedVideo.video_url}
            controls
            autoPlay
            className="expanded-video"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <div className="section-header">
        <span className="section-title">Recent Footage</span>
        <span className="video-count">{videos.length} clips</span>
      </div>

      <div className="video-grid">
        {videos.map((video) => (
          <div
            key={video.id}
            className="video-card"
            onClick={() => handleSelect(video)}
          >
            <video preload="none" poster={video.thumbnail_url} className="grid-video" />
            <div className="card-overlay">
              <div className="play-icon">
                <svg viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21" /></svg>
              </div>
            </div>
            <div className="card-footer">
              <span className="card-timestamp">{formatTimestamp(video.created_at)}</span>
              {confirmId === video.id ? (
                <div className="delete-confirm" onClick={(e) => e.stopPropagation()}>
                  <span className="confirm-label">Delete?</span>
                  <button className="btn btn-danger btn-xs" onClick={(e) => handleConfirmDelete(e, video.id)}>Yes</button>
                  <button className="btn btn-ghost btn-xs" onClick={handleCancelDelete}>No</button>
                </div>
              ) : (
                <button
                  className="btn btn-icon"
                  title="Delete clip"
                  onClick={(e) => handleDeleteClick(e, video.id)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14H6L5 6" />
                    <path d="M10 11v6M14 11v6" />
                    <path d="M9 6V4h6v2" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

function App() {
  const [authed, setAuthed] = useState(!!getToken())
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [settingsOpen, setSettingsOpen] = useState(false)

  useEffect(() => {
    if (!authed) return
    setLoading(true)
    authFetch(`${API_BASE}/videos`)
      .then((res) => {
        if (res.status === 401) { clearToken(); setAuthed(false); return null }
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data) => {
        if (data) { setVideos(data); setLoading(false) }
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [authed])

  const handleLogout = () => {
    clearToken()
    setAuthed(false)
    setVideos([])
  }

  const handleDelete = (id) => {
    authFetch(`${API_BASE}/videos/${id}`, { method: 'DELETE' })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        setVideos((prev) => prev.filter((v) => v.id !== id))
      })
      .catch((err) => console.error('Delete failed:', err))
  }

  if (!authed) return <LoginPage onLogin={() => setAuthed(true)} />

  return (
    <div className="app-layout">
      <Navbar onSettingsOpen={() => setSettingsOpen(true)} onLogout={handleLogout} />
      {settingsOpen && <SettingsPanel onClose={() => setSettingsOpen(false)} />}
      <main className="main-content">
        {loading && (
          <div className="state-container">
            <div className="spinner" />
            <span>Loading footage...</span>
          </div>
        )}
        {error && (
          <div className="state-container">
            <span className="error-text">Failed to load: {error}</span>
          </div>
        )}
        {!loading && !error && <VideoGrid videos={videos} onDelete={handleDelete} />}
      </main>
    </div>
  )
}

export default App
