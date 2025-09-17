const BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function postChat(message, sessionId) {
  const body = sessionId ? { sessionId, message } : { message };
  const res = await fetch(`${BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Chat request failed: ${res.status} ${text}`);
  }
  return res.json();
}

async function getHistory(sessionId) {
  const res = await fetch(`${BASE}/session/${sessionId}/history`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`History request failed: ${res.status} ${text}`);
  }
  return res.json();
}

async function clearSession(sessionId) {
  const res = await fetch(`${BASE}/session/${sessionId}/clear`, {
    method: "POST"
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Clear session failed: ${res.status} ${text}`);
  }
  return res.json();
}

async function healthCheck() {
  try {
    const res = await fetch(`${BASE}/health`);
    if (!res.ok) return { ok: false, status: res.status };
    const data = await res.json();
    return { ok: true, data };
  } catch (e) {
    return { ok: false, status: "network_error" };
  }
}

export { BASE, postChat, getHistory, clearSession, healthCheck };
