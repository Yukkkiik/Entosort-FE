"use client";

import { useEffect, useState, useRef } from "react";
import { Activity, Cpu, Zap, Radio, Eye } from "lucide-react";
import { useWebSocket } from "@/contexts/WebSocketContext";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RawDetection {
  class:      string;
  confidence: number;
  bbox?:      number[];
}

interface AiDetection {
  timestamp:    number;
  fps:          number | null;
  detections:   RawDetection[];
  frame:        string | null;
  frame_width:  number | null;
  frame_height: number | null;
}

interface WsDetectionData {
  timestamp:    number;
  fps:          number | null;
  detections:   RawDetection[];
  frame:        string | null;
  frame_width:  number | null;
  frame_height: number | null;
}

interface WsStatusData {
  status?: "running" | "stopped" | "error" | "waiting";
  message?: string;
}


interface CameraPreviewProps {
  nodeId?: string;
  temperature?: number;
  speed?: number;
  onDetectionUpdate?: (data: {
    larvaCount: number;
    prepupaCount: number;
    totalDetected: number;
    avgConfidence: number;
    fps: number;
  }) => void;
}

const DETECTION_HOLD_MS  = 1500;
const DETECTION_RESET_MS = 3000;

// ─── CameraPreview ────────────────────────────────────────────────────────────

export default function CameraPreview({
  nodeId      = "rpi-node-01",
  temperature = 28,
  speed       = 15,
  onDetectionUpdate,
}: CameraPreviewProps) {
  const { isConnected, subscribe } = useWebSocket();

  const [scanPos,    setScanPos]    = useState(0);
  const [frameCount, setFrameCount] = useState(0);
  const [pulseRing,  setPulseRing]  = useState(false);
  const [aiStatus,   setAiStatus]   = useState<"running" | "stopped" | "error" | "waiting">("waiting");
  const [aiData,     setAiData]     = useState<AiDetection | null>(null);
  const [liveFps,    setLiveFps]    = useState(0);
  const [frameB64,   setFrameB64]   = useState<string | null>(null);

  const onDetectionRef = useRef(onDetectionUpdate);
  useEffect(() => { onDetectionRef.current = onDetectionUpdate; }, [onDetectionUpdate]);

  const lastDetectionFrameAt = useRef(0);
  const detectionHoldTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── WebSocket ──────────────────────────────────────────────────────────────
useEffect(() => {
    const unsubDetection = subscribe("ai:detection", (msg) => {
      const data = msg.data as WsDetectionData;
      if (!data) return;

      const hasDetections = data.detections && data.detections.length > 0;
      const now = Date.now();

      setAiData(data);
      setAiStatus("running");
      if (data.fps != null) setLiveFps(data.fps);

      if (data.frame) {
        if (hasDetections) {
          lastDetectionFrameAt.current = now;
          setFrameB64(data.frame);
          setFrameCount((c) => c + 1);

          if (detectionHoldTimer.current) clearTimeout(detectionHoldTimer.current);
          detectionHoldTimer.current = setTimeout(() => {
            lastDetectionFrameAt.current = 0;
          }, DETECTION_RESET_MS);
        } else {
          const elapsed = now - lastDetectionFrameAt.current;
          if (elapsed >= DETECTION_HOLD_MS) {
            setFrameB64(data.frame);
            setFrameCount((c) => c + 1);
          }
        }
      }

      onDetectionRef.current?.({
        larvaCount:    data.detections.filter((d) => d.class === "larva").length,
        prepupaCount:  data.detections.filter((d) => d.class === "prepupa").length,
        totalDetected: data.detections.length,
        avgConfidence: data.detections.length
          ? Math.round(data.detections.reduce((s, d) => s + d.confidence, 0) / data.detections.length * 100)
          : 0,
        fps: data.fps ?? 0,
      });
    });

    const unsubStatus = subscribe("ai:status", (msg) => {
      const data = msg.data as WsStatusData;
      setAiStatus(data?.status ?? "waiting");
    });

    return () => {
      unsubDetection();
      unsubStatus();
      if (detectionHoldTimer.current) clearTimeout(detectionHoldTimer.current);
    };
  }, [subscribe]);

  // ── Scan line & pulse ring animation tetap sama persis ──────────────────
  useEffect(() => {
    const id = setInterval(() => setScanPos((p) => (p >= 100 ? 0 : p + 0.4)), 16);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setPulseRing(true);
      setTimeout(() => setPulseRing(false), 700);
    }, 2500);
    return () => clearInterval(id);
  }, []);

  const wsConnected = isConnected;

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

        {frameB64 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`data:image/jpeg;base64,${frameB64}`}
            alt="BSF Live Detection"
            className="w-full h-full object-cover"
          />
        ) : (
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

        {/* ── Top-left: badges ── */}
        <div className="absolute top-4 left-4 flex items-center gap-2 flex-wrap">
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

          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-mono text-gray-400">
            <Activity size={10} className="text-lime-400" />
            {liveFps.toFixed(1)} FPS
          </div>

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