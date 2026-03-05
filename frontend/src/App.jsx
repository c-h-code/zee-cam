import { useEffect, useState } from "react";

const API = "http://127.0.0.1:8000";

export default function App() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const res = await fetch(`${API}/videos?limit=20`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setVideos(data);
    } catch (e) {
      setErr(String(e));
    } finally {
      setLoading(false);
    }
  }

  async function onDelete(id) {
    if (!confirm(`Delete ${id}?`)) return;
    const res = await fetch(`${API}/videos/${id}`, { method: "DELETE" });
    if (res.ok) load();
    else alert(`Delete failed: HTTP ${res.status}`);
  }

  useEffect(() => { load(); }, []);

  return (
    <div style={{ padding: 16, fontFamily: "system-ui" }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>Zee-Cam</h2>
        <button onClick={load}>Refresh</button>
        {loading && <span>Loading…</span>}
        {err && <span style={{ color: "crimson" }}>{err}</span>}
      </div>

      <div
        style={{
          marginTop: 16,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 12,
        }}
      >
        {videos.map((v) => (
          <div
            key={v.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 12,
              padding: 10,
            }}
          >
           

            <div style={{ fontSize: 12, marginTop: 8, opacity: 0.8 }}>
              <div><b>{v.id}</b></div>
              <div>{v.created_at}</div>
            </div>

            <video
              src={v.video_url}
              poster={v.thumbnail_url}

              controls
              preload="none"
              style={{ width: "100%", marginTop: 8, borderRadius: 10 }}
            />

            <button
              onClick={() => onDelete(v.id)}
              style={{ marginTop: 10, width: "100%" }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}