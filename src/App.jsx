// import React, { useState } from "react";
// import Sidebar from "./components/Sidebar";
// import ChatWindow from "./components/ChatWindow";

// export default function App() {
//   const [sessionId, setSessionId] = useState(null);
//   const [quickQuestion, setQuickQuestion] = useState(null);

//   const onNewSession = () => {
//     setSessionId(null);
//   };

//   return (
//     <div className="app">
//       <div className="sidebar">
//         <Sidebar onNewSession={onNewSession} setQuickQuestion={(q) => setQuickQuestion(q)} />
//       </div>

//       <div style={{display:"flex", flexDirection:"column"}}>
//         <ChatWindow initialSessionId={sessionId} onSessionChange={(sid) => setSessionId(sid)} />
//       </div>
//     </div>
//   );
// }
import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";

export default function App() {
  const [sessionId, setSessionId] = useState(null);
  const [quickQuestion, setQuickQuestion] = useState(null);

  const onNewSession = () => {
    setSessionId(null);
  };

  return (
    <div className="app">
      <Sidebar
        onNewSession={onNewSession}
        setQuickQuestion={(q) => setQuickQuestion(q)}
        currentSessionId={sessionId}
        onSelectSession={(sid) => setSessionId(sid)}
      />

      <div style={{ display: "flex", flexDirection: "column" }}>
        <ChatWindow
          initialSessionId={sessionId}
          onSessionChange={(sid) => setSessionId(sid)}
          quickQuestion={quickQuestion}
        />
      </div>
    </div>
  );
}
