


import React, { useEffect, useRef, useState } from "react";
import Message from "./Message";
import { BASE, postChat, getHistory, clearSession } from "../api/api";

export default function ChatWindow({ initialSessionId, onSessionChange }) {
  const [sessionId, setSessionId] = useState(initialSessionId || null);
  const [messages, setMessages] = useState([]);
  const [retrieved, setRetrieved] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const bodyRef = useRef();

  // Load past history
  useEffect(() => {
    async function loadHistory() {
      if (!sessionId) return;
      try {
        const res = await getHistory(sessionId);
        setMessages(res.history || []);
      } catch (e) {
        console.error("Failed to load history:", e);
      }
    }
    loadHistory();
  }, [sessionId]);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages]);

  // --- Streaming Gemini reply ---
  const streamMessage = async (message, sid) => {
    try {
      const response = await fetch(`${BASE}/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, sessionId: sid }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let text = "";

      setTyping(true);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data:")) {
            const data = line.replace("data:", "").trim();

            if (data === "[DONE]") {
              setTyping(false);
              setLoading(false);
              return;
            }

            text += data + " ";
            setMessages((prev) => {
              const updated = [...prev];
              if (updated.length > 0) {
                updated[updated.length - 1].text = text;
              }
              return updated;
            });
          }
        }
      }
    } catch (err) {
      console.error("Streaming error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "⚠️ Error: " + err.message },
      ]);
      setTyping(false);
      setLoading(false);
    }
  };

  const send = async () => {
    if (!text.trim()) return;
    setLoading(true);

    const userEntry = { role: "user", text: text.trim() };
    setMessages((prev) => [...prev, userEntry]);

    setMessages((prev) => [...prev, { role: "assistant", text: "" }]);

    try {
      await streamMessage(text.trim(), sessionId);

      const res = await postChat(text.trim(), sessionId);
      setSessionId(res.sessionId);
      if (onSessionChange) onSessionChange(res.sessionId);

      setRetrieved(res.retrieved || []);
      setText("");
    } catch (err) {
      console.error("Send error:", err);
    } finally {
      setLoading(false);
      setTyping(false);
    }
  };

  const onKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const handleClear = async () => {
    if (!sessionId) return;
    try {
      await clearSession(sessionId);
      setMessages([]);
      setRetrieved([]);
      setSessionId(null);
      if (onSessionChange) onSessionChange(null);
    } catch (e) {
      console.error("Clear session error:", e);
    }
  };

  return (
    <div className="chat">
      <div className="chat-header">
        <div style={{ fontWeight: 700 }}>RAG News — Assistant</div>
        <div style={{ marginLeft: 12, color: "#6b7280" }}>
          Session: {sessionId || "New (created after first message)"}
        </div>
        <div style={{ marginLeft: "auto" }}>
          <button className="btn btn-outline" onClick={handleClear}>
            🗑️ Clear
          </button>
        </div>
      </div>

      <div className="chat-body" ref={bodyRef}>
        <div className="messages">
          {messages.map((m, i) => (
            <Message key={i} m={m} />
          ))}
          {typing && (
            <div className="message assistant">
              <span className="typing-dots">
                <span>.</span>
                <span>.</span>
                <span>.</span>
              </span>
            </div>
          )}
        </div>

        {retrieved && retrieved.length > 0 && (
          <div className="retrieved">
            <strong>Retrieved passages</strong>
            {retrieved.map((r, idx) => (
              <div className="item" key={idx}>
                <a href={r.url} target="_blank" rel="noreferrer">
                  {r.title || "Untitled"}
                </a>
                <div
                  style={{
                    marginTop: 6,
                    color: "#374151",
                    fontSize: 13,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {r.text}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="chat-footer">
        <div className="input-row">
          <textarea
            placeholder="Type your question (press Enter to send)..."
            className="textarea"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKey}
          />
          <button className="send" onClick={send} disabled={loading}>
            {loading ? "Thinking..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
