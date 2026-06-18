"use client";

import { useEffect, useState, useRef } from "react";
import { Activity, Cpu, Zap, Radio, Eye } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RawDetection {
  class:      string;   // "larva" | "prepupa"
  confidence: number;   // 0–1 dari Python
  bbox?:      number[]; // opsional, tidak dirender di frontend karena frame sudah dianotasi AI
}

interface AiDetection {
  timestamp:    number;
  fps:          number | null;
  detections:   RawDetection[];
  frame:        string | null; // base64 JPEG annotated
  frame_width:  number | null;
  frame_height: number | null;
}

// Envelope dari broadcastEvent() backend
interface WsMessage {
  type:      string;
  data:      any;
  timestamp: string;
}

interface CameraPreviewProps {
  /** nodeId untuk identifikasi device */
  nodeId?: string;
  /** WebSocket URL backend. Default: NEXT_PUBLIC_WS_URL atau ws://localhost:3001 */
  wsUrl?: string;
  /** Suhu dari sensor IoT */
  temperature?: number;
  /** Kecepatan belt conveyor (mm/s) */
  speed?: number;
}

// ─── CameraPreview ────────────────────────────────────────────────────────────

export default function CameraPreview({
  nodeId      = "rpi-node-01",
  wsUrl       = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:3001",
  temperature = 28,
  speed       = 15,
}: CameraPreviewProps) {

  // ── State ──────────────────────────────────────────────────────────────────
  const [scanPos,     setScanPos]     = useState(0);
  const [frameCount,  setFrameCount]  = useState(0);
  const [pulseRing,   setPulseRing]   = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [aiStatus,    setAiStatus]    = useState<"running" | "stopped" | "error" | "waiting">("waiting");

  // Data live dari AI engine via backend
  const [aiData,     setAiData]     = useState<AiDetection | null>(null);
  const [liveFps,    setLiveFps]    = useState<number>(0);
  const [frameB64,   setFrameB64]   = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);

  // ── WebSocket ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!wsUrl) return;

    const connect = () => {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setWsConnected(true);
        console.log("[WS] Connected ke backend");
      };

      ws.onclose = () => {
        setWsConnected(false);
        setAiStatus("stopped");
        setTimeout(connect, 3000);
      };

      ws.onerror = (e) => console.error("[WS] Error:", e);

      ws.onmessage = (e) => {
        try {
          const msg: WsMessage = JSON.parse(e.data);

          // ── ai:detection ────────────────────────────
          if (msg.type === "ai:detection") {
            const data: AiDetection = msg.data;
            setAiData(data);
            setAiStatus("running");

            // FPS real dari AI engine
            if (data.fps != null) setLiveFps(data.fps);

            // Frame annotated dari Python (sudah ada bbox drawn)
            if (data.frame) {
              setFrameB64(data.frame);
              // frame counter
              setFrameCount((c) => c + 1);
            }

            // Frontend tidak menggambar bounding box sendiri.
            // Frame dari AI engine/Python sudah berisi hasil anotasi deteksi.
            return;
          }

          // ── ai:status ───────────────────────────────
          if (msg.type === "ai:status") {
            setAiStatus(msg.data.status ?? "waiting");
            return;
          }

          // ── connected handshake ─────────────────────
          if (msg.type === "connected") {
            console.log("[WS] Server ready:", msg.data?.message);
            return;
          }

        } catch (err) {
          console.warn("[WS] Parse error:", err);
        }
      };
    };

    connect();
    return () => wsRef.current?.close();
  }, [wsUrl]);

  // ── Scan line animation ────────────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => setScanPos((p) => (p >= 100 ? 0 : p + 0.4)), 16);
    return () => clearInterval(id);
  }, []);

  // ── Pulse ring ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      setPulseRing(true);
      setTimeout(() => setPulseRing(false), 700);
    }, 2500);
    return () => clearInterval(id);
  }, []);

  // ── Derived state ──────────────────────────────────────────────────────────
  const totalDetected = aiData?.detections.length ?? 0;
  const larvaCount    = aiData?.detections.filter((d) => d.class === "larva").length   ?? 0;
  const prepupaCount  = aiData?.detections.filter((d) => d.class === "prepupa").length ?? 0;

  const avgConfidence = aiData?.detections.length
    ? Math.round(
        (aiData.detections.reduce((s, d) => s + d.confidence, 0) /
          aiData.detections.length) * 100
      )
    : 0;

  const primaryLabel = prepupaCount
    ? `PREPUPA ×${prepupaCount}`
    : larvaCount
    ? `LARVA ×${larvaCount}`
    : "MENUNGGU...";

  const statusColor = {
    running: "text-lime-400 border-lime-400/30",
    stopped: "text-red-400 border-red-400/30",
    error:   "text-orange-400 border-orange-400/30",
    waiting: "text-gray-500 border-gray-500/30",
  }[aiStatus];

  const statusDot = {
    running: "bg-lime-400",
    stopped: "bg-red-400",
    error:   "bg-orange-400",
    waiting: "bg-gray-500",
  }[aiStatus];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="group relative rounded-3xl overflow-hidden bg-[#0c0c0e] border border-white/10
      shadow-[0_4px_40px_rgba(0,0,0,0.15)] hover:shadow-[0_8px_60px_rgba(163,230,53,0.08)]
      transition-shadow duration-500 opacity-0 animate-[fadeSlideUp_0.6s_ease_0.1s_forwards]">

      {/* ── Camera Viewport ── */}
      <div className="relative w-full aspect-[16/8] min-h-[220px] overflow-hidden">

        {/* Frame base64 dari AI engine (sudah dianotasi YOLOv8) */}
        {frameB64 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`data:image/jpeg;base64,${frameB64}`}
            alt="BSF Live Detection"
            className="w-full h-full object-cover"
          />
        ) : (
          /* Placeholder saat belum ada frame */
          <div className="w-full h-full bg-[#0c0c0e] flex items-center justify-center relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(163,230,53,1) 1px, transparent 1px), linear-gradient(90deg, rgba(163,230,53,1) 1px, transparent 1px)",
                backgroundSize: "32px 32px",
              }}
            />
            <div className="absolute w-64 h-64 bg-lime-500/5 rounded-full blur-3xl top-0 left-1/4" />
            <div className="absolute w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl bottom-0 right-1/4" />
            <div className="flex flex-col items-center gap-2 text-center z-10">
              <div className="text-5xl opacity-20">🦟</div>
              <p className="text-xs text-gray-600 font-mono tracking-widest uppercase">
                {wsConnected
                  ? "Menunggu frame dari AI engine..."
                  : "Menghubungkan ke server..."}
              </p>
            </div>
          </div>
        )}

        {/* Scan line */}
        <div
          className="absolute left-0 right-0 h-px pointer-events-none"
          style={{
            top: `${scanPos}%`,
            background:
              "linear-gradient(90deg, transparent 0%, rgba(163,230,53,0.6) 30%, rgba(163,230,53,0.9) 50%, rgba(163,230,53,0.6) 70%, transparent 100%)",
            boxShadow: "0 0 10px rgba(163,230,53,0.5)",
          }}
        />

        {/* Bounding box tidak dirender di frontend.
            Tampilan deteksi sepenuhnya mengandalkan frame anotasi dari AI engine. */}

        {/* ── Top-left: badges ── */}
        <div className="absolute top-4 left-4 flex items-center gap-2 flex-wrap">
          {/* LIVE badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-bold tracking-widest text-white">
            <span className="relative flex w-2 h-2">
              <span
                className={`absolute inline-flex h-full w-full rounded-full bg-red-400 ${
                  pulseRing ? "animate-ping" : ""
                } opacity-75`}
              />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            LIVE
          </div>

          {/* FPS live */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-mono text-gray-400">
            <Activity size={10} className="text-lime-400" />
            {liveFps.toFixed(1)} FPS
          </div>

          {/* WebSocket status */}
          <div
            className={`flex items-center gap-1 px-2 py-1.5 rounded-full bg-black/60 backdrop-blur-md border text-[10px] font-mono ${
              wsConnected
                ? "border-lime-400/30 text-lime-400"
                : "border-red-400/30 text-red-400"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                wsConnected ? "bg-lime-400" : "bg-red-400"
              }`}
            />
            {wsConnected ? "WS" : "WS OFF"}
          </div>

          {/* AI engine status */}
          <div
            className={`flex items-center gap-1 px-2 py-1.5 rounded-full bg-black/60 backdrop-blur-md border text-[10px] font-mono uppercase ${statusColor}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`} />
            {aiStatus}
          </div>
        </div>

        {/* ── Top-right: IoT stats ── */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
            <span className="text-orange-400 text-[10px]">🌡</span>
            <span className="text-xs font-bold text-white font-mono">{temperature}°C</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
            <Zap size={10} className="text-lime-400" />
            <span className="text-xs font-bold text-white font-mono">{speed} mm/s</span>
          </div>
        </div>

        {/* ── Bottom-left: detection count ── */}
        <div className="absolute bottom-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-lime-400/20">
          <Eye size={11} className="text-lime-400" />
          <span className="text-[11px] font-bold text-lime-400 font-mono">
            {totalDetected} DETECTED
          </span>
        </div>

        {/* ── Bottom-right: frame counter ── */}
        <div className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
          <Cpu size={10} className="text-gray-500" />
          <span className="text-[10px] font-mono text-gray-500">
            FRAME #{String(frameCount).padStart(6, "0")}
          </span>
        </div>
      </div>

      {/* ── Bottom info bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 border-t border-white/5 bg-[#0f0f11]">

        {/* Primary detection */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-lime-400/10 border border-lime-400/20 flex items-center justify-center">
            <Radio size={14} className="text-lime-400" />
          </div>
          <div>
            <div className="text-[10px] text-gray-600 uppercase tracking-widest font-semibold">
              Primary Detection
            </div>
            <div className="text-sm font-bold text-white font-mono">
              {avgConfidence > 0 ? `${avgConfidence}%` : "—"}{" "}
              <span className="text-lime-400">{primaryLabel}</span>
            </div>
          </div>
        </div>

        {/* Count chips */}
        {aiData && aiData.detections.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {prepupaCount > 0 && (
              <Chip label="PREPUPA" count={prepupaCount} color="#a3e635" />
            )}
            {larvaCount > 0 && (
              <Chip label="LARVA" count={larvaCount} color="#38bdf8" />
            )}
          </div>
        )}

        {/* Model info */}
        <div className="flex items-center gap-2 text-[10px] font-mono text-gray-600">
          <Cpu size={10} className="text-gray-500" />
          <span>YOLOv8 · EntoSort · {nodeId}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Chip ─────────────────────────────────────────────────────────────────────

function Chip({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold font-mono"
      style={{
        borderColor:     `${color}33`,
        color,
        backgroundColor: `${color}0d`,
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      {label} ×{count}
    </div>
  );
}