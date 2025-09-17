import React from "react";

export default function Message({ m }) {
  const isUser = m.role === "user";
  return (
    <div className={`msg ${isUser ? "user" : ""}`}>
      <div>{m.text}</div>
      <div className="meta">{isUser ? "You" : "Assistant"}</div>
    </div>
  );
}
