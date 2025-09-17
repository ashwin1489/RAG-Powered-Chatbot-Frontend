import React, { useEffect, useState } from "react";
import { healthCheck } from "../api/api";

export default function HealthBadge() {
  const [status, setStatus] = useState({ loading: true, ok: false });

  useEffect(() => {
    let mounted = true;
    async function check() {
      const r = await healthCheck();
      if (!mounted) return;
      setStatus({ loading: false, ok: !!r.ok });
    }
    check();
    const t = setInterval(check, 10000);
    return () => { mounted = false; clearInterval(t); };
  }, []);

  return (
    <div className="health">
      <div style={{
        width:10,height:10,borderRadius:10,
        background: status.loading ? "#f59e0b" : status.ok ? "#10b981" : "#ef4444"
      }} />
      <div>{status.loading ? "Checking..." : status.ok ? "Backend OK" : "Backend down"}</div>
    </div>
  );
}
