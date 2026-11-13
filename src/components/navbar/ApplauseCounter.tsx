"use client";

import { useEffect, useRef, useState } from "react";
import { APPLAUSE_BASE_COUNT, deviceApplauseTotal } from "@/lib/applause";
import { storage } from "@/lib/codeforces";

const LOCAL_KEY = "cf_device_applause_v1";
function localCount() {
  const value = Number(storage.get(LOCAL_KEY));
  return Number.isSafeInteger(value) && value >= 0 ? value : 0;
}
function validCount(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

type Props = { initial?: number; className?: string; pollInterval?: number };
export default function ApplauseCounter({ initial, className = "", pollInterval = 60000 }: Props) {
  const [count, setCount] = useState(initial ?? APPLAUSE_BASE_COUNT);
  const [mode, setMode] = useState<"loading" | "shared" | "device">("loading");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const busy = useRef(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const response = await fetch("/api/applause", { signal: AbortSignal.timeout(8000) });
        if (!response.ok) throw new Error("Shared counter unavailable");
        const data = await response.json();
        if (!validCount(data.count)) throw new Error("Invalid count");
        if (active) { setCount(data.count); setMode("shared"); }
      } catch {
        if (active) { setCount(deviceApplauseTotal(localCount())); setMode("device"); }
      }
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (mode !== "shared" || pollInterval <= 0) return;
    let active = true;
    const id = setInterval(async () => {
      if (busy.current) return;
      try {
        const response = await fetch("/api/applause", { signal: AbortSignal.timeout(8000) });
        if (!response.ok) return;
        const data = await response.json();
        if (active && !busy.current && validCount(data.count)) setCount(data.count);
      } catch { /* The button remains available if a background refresh fails. */ }
    }, pollInterval);
    return () => { active = false; clearInterval(id); };
  }, [mode, pollInterval]);

  async function clap() {
    if (busy.current || mode === "loading") return;
    if (mode === "device") {
      const additional = Math.min(Number.MAX_SAFE_INTEGER - APPLAUSE_BASE_COUNT, Math.max(count - APPLAUSE_BASE_COUNT, localCount()) + 1);
      const next = deviceApplauseTotal(additional);
      storage.set(LOCAL_KEY, String(additional));
      setCount(next); setMessage(storage.get(LOCAL_KEY) === String(additional) ? "Thanks! Your clap is saved on this device." : "Thanks! Your clap is counted for this session.");
      return;
    }
    busy.current = true; setPending(true); setMessage("");
    try {
      const response = await fetch("/api/applause", { method: "POST", signal: AbortSignal.timeout(8000) });
      if (!response.ok) throw new Error(response.status === 429 ? "Clap limit reached. Please try again later." : "Could not save your clap. Please try again.");
      const data = await response.json();
      if (!validCount(data.count)) throw new Error("Could not confirm your clap. Please try again.");
      setCount(data.count); setMessage("Thanks for the applause!");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Please try again.");
    } finally { busy.current = false; setPending(false); }
  }

  return <div className="desk-applause-wrap">
    <button onClick={() => void clap()} disabled={pending || mode === "loading"} className={`desk-clap ${className}`} aria-label="Applause / Clap" aria-busy={pending || mode === "loading"} title={mode === "device" ? "Starting total: 157,452. Additional claps are saved on this device while the shared counter is unavailable." : "Give CF Ladder a clap"}>
      <span aria-hidden="true">👏</span>
      <span className="tabular-nums">{count.toLocaleString()}</span>
      <span className="desk-clap-scope">{mode === "device" ? "LOCAL" : "CLAPS"}</span>
    </button>
    <span className="sr-only" role="status">{message || (mode === "device" ? "Applause is saved on this device while the shared counter is unavailable." : "")}</span>
  </div>;
}
