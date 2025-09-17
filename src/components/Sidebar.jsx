
// import React, { useEffect, useState } from "react";
// import HealthBadge from "./HealthBadge";
// import { clearSession } from "../api/api";

// export default function Sidebar({ onNewSession, setQuickQuestion, currentSessionId, onSelectSession }) {
//   const [sessions, setSessions] = useState([]);

//   // Load sessions from localStorage
//   useEffect(() => {
//     const stored = JSON.parse(localStorage.getItem("sessions") || "[]");
//     setSessions(stored);
//   }, []);

//   // Add current session if not stored
//   useEffect(() => {
//     if (currentSessionId) {
//       setSessions((prev) => {
//         if (!prev.includes(currentSessionId)) {
//           const updated = [...prev, currentSessionId];
//           localStorage.setItem("sessions", JSON.stringify(updated));
//           return updated;
//         }
//         return prev;
//       });
//     }
//   }, [currentSessionId]);

//   const handleSelect = (sid) => {
//     onSelectSession(sid);
//   };

//   const handleClear = async (sid, e) => {
//     e.stopPropagation();
//     try {
//       await clearSession(sid);
//       const updated = sessions.filter((s) => s !== sid);
//       setSessions(updated);
//       localStorage.setItem("sessions", JSON.stringify(updated));
//       if (sid === currentSessionId) {
//         onSelectSession(null);
//       }
//     } catch (err) {
//       console.error("Failed to clear session:", err);
//     }
//   };

//   const quick = [
//     "What is happening in Indian politics today?",
//     "Summarize world politics in 3 bullets",
//     "Latest on India vs Pakistan cricket"
//   ];

//   return (
//     <div className="sidebar">
//       <div className="brand">
//         <div className="logo">R</div>
//         <div>
//           <div style={{ fontWeight: 700 }}>RAG News</div>
//           <div style={{ fontSize: 13, color: "#6b7280" }}>News assistant</div>
//         </div>
//       </div>

//       <div className="content">
//         <div style={{ marginBottom: 12 }}>
//           <HealthBadge />
//         </div>

//         <div style={{ marginBottom: 12 }}>
//           <button className="btn btn-primary" onClick={() => onNewSession()}>
//             + New Session
//           </button>
//         </div>

//         {/* Sessions list */}
//         <div style={{ marginBottom: 16 }}>
//           <div style={{ fontWeight: 600, marginBottom: 8 }}>Previous Chats</div>
//           {sessions.length === 0 && (
//             <div style={{ fontSize: 13, color: "#9ca3af" }}>No chats yet</div>
//           )}
//           <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
//             {sessions.map((sid) => (
//               <li
//                 key={sid}
//                 style={{
//                   display: "flex",
//                   justifyContent: "space-between",
//                   alignItems: "center",
//                   padding: "6px 8px",
//                   borderRadius: 6,
//                   cursor: "pointer",
//                   background: sid === currentSessionId ? "#e5e7eb" : "transparent",
//                   marginBottom: 4,
//                   fontSize: 13
//                 }}
//                 onClick={() => handleSelect(sid)}
//               >
//                 <span>{sid.slice(0, 8)}...</span>
//                 <button
//                   style={{
//                     background: "transparent",
//                     border: "none",
//                     color: "#ef4444",
//                     cursor: "pointer",
//                     fontSize: 12
//                   }}
//                   onClick={(e) => handleClear(sid, e)}
//                 >
//                   ✖
//                 </button>
//               </li>
//             ))}
//           </ul>
//         </div>

//         {/* Quick prompts */}
//         <div>
//           <div style={{ fontWeight: 600, marginBottom: 8 }}>Quick prompts</div>
//           <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
//             {quick.map((q, i) => (
//               <button
//                 key={i}
//                 className="btn btn-outline"
//                 onClick={() => setQuickQuestion(q)}
//               >
//                 {q}
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>

//       <div
//         style={{
//           padding: 16,
//           borderTop: "1px solid #eef2f6",
//           fontSize: 13,
//           color: "#9ca3af"
//         }}
//       >
//         Tip: Use New Session to start fresh.
//       </div>
//     </div>
//   );
// }


import React, { useEffect, useState } from "react";
import HealthBadge from "./HealthBadge";
import { clearSession, getHistory } from "../api/api";

export default function Sidebar({ onNewSession, setQuickQuestion, currentSessionId, onSelectSession }) {
  const [sessions, setSessions] = useState([]);

  // Load sessions from localStorage
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("sessions") || "[]");
    setSessions(stored);
  }, []);

  // Ensure session is saved with first user query
  useEffect(() => {
    async function saveSessionWithTitle() {
      if (!currentSessionId) return;

      const exists = sessions.find((s) => s.id === currentSessionId);
      if (exists) return;

      try {
        const res = await getHistory(currentSessionId);
        const history = res.history || [];
        const firstUserMessage = history.find((m) => m.role === "user");
        const title = firstUserMessage ? firstUserMessage.text.slice(0, 40) : "New Chat";

        const updated = [...sessions, { id: currentSessionId, title }];
        setSessions(updated);
        localStorage.setItem("sessions", JSON.stringify(updated));
      } catch (err) {
        console.error("Failed to fetch history for session:", err);
      }
    }

    saveSessionWithTitle();
  }, [currentSessionId]);

  const handleSelect = (sid) => {
    onSelectSession(sid);
  };

  const handleClear = async (sid, e) => {
    e.stopPropagation();
    try {
      await clearSession(sid);
      const updated = sessions.filter((s) => s.id !== sid);
      setSessions(updated);
      localStorage.setItem("sessions", JSON.stringify(updated));
      if (sid === currentSessionId) {
        onSelectSession(null);
      }
    } catch (err) {
      console.error("Failed to clear session:", err);
    }
  };

  const quick = [
    "What is happening in Indian politics today?",
    "Summarize world politics in 3 bullets",
    "Latest on India vs Pakistan cricket"
  ];

  return (
    <div className="sidebar">
      <div className="brand">
        <div className="logo">R</div>
        <div>
          <div style={{ fontWeight: 700 }}>RAG News</div>
          <div style={{ fontSize: 13, color: "#6b7280" }}>News assistant</div>
        </div>
      </div>

      <div className="content">
        <div style={{ marginBottom: 12 }}>
          <HealthBadge />
        </div>

        <div style={{ marginBottom: 12 }}>
          <button className="btn btn-primary" onClick={() => onNewSession()}>
            + New Session
          </button>
        </div>

        {/* Sessions list */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Previous Chats</div>
          {sessions.length === 0 && (
            <div style={{ fontSize: 13, color: "#9ca3af" }}>No chats yet</div>
          )}
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {sessions.map((s) => (
              <li
                key={s.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "6px 8px",
                  borderRadius: 6,
                  cursor: "pointer",
                  background: s.id === currentSessionId ? "#e5e7eb" : "transparent",
                  marginBottom: 4,
                  fontSize: 13
                }}
                onClick={() => handleSelect(s.id)}
              >
                <span>{s.title}</span>
                <button
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#ef4444",
                    cursor: "pointer",
                    fontSize: 12
                  }}
                  onClick={(e) => handleClear(s.id, e)}
                >
                  ✖
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick prompts */}
        <div>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Quick prompts</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {quick.map((q, i) => (
              <button
                key={i}
                className="btn btn-outline"
                onClick={() => setQuickQuestion(q)}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        style={{
          padding: 16,
          borderTop: "1px solid #eef2f6",
          fontSize: 13,
          color: "#9ca3af"
        }}
      >
        Tip: Use New Session to start fresh.
      </div>
    </div>
  );
}
