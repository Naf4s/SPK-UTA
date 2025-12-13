// hooks/useSessionID.ts
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

export function useSessionID() {
  const [sessionId, setSessionId] = useState("");

  useEffect(() => {
    // Cek apakah sudah punya KTP di LocalStorage?
    let current = localStorage.getItem("spk_session_id");
    
    // Kalau belum punya, buat baru (User Baru)
    if (!current) {
      current = uuidv4();
      localStorage.setItem("spk_session_id", current);
    }
    
    setSessionId(current);
  }, []);

  return sessionId;
}