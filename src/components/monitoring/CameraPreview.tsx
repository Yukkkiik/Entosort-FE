"use client";

import { useEffect, useState, useRef } from "react";
import { Activity, Cpu, Zap, Radio, Eye } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Detection {
  id: string;
  label: string;
  confidence: number;
  x: number; y: number; w: number; h: number;
  color?: string;
}

// Payload dari broadcast() Express → harvest_update
interface HarvestUpdate {
  nodeId: string;
  larvaCount: number;
  prepupaCount: number;
  rejectCount: number;
  totalCount: number;
  recordedAt: string;
}

interface CameraPreviewProps {
  /**
   * URL MJPEG stream Raspberry Pi.
   * Contoh: "http://192.168.1.100:8080/stream"
   * Bisa di-set via env: process.env.NEXT_PUBLIC_PI_STREAM_URL
   */
  streamUrl?: string;
  /** nodeId untuk filter broadcast WebSocket */
  nodeId?: string;
  /** URL WebSocket Express (socket.io atau ws://) */
  wsUrl?: string;
  temperature?: number;
  speed?: number;
  fps?: number;
}

// ─── BoundingBox (tidak berubah) ──────────────────────────────────────────────

function BoundingBox({ det, visible }: { det: Detection; visible: boolean }) {
  const color = det.color ?? "#a3e635";
  return (
    <div
      className={`absolute transition-all duration-500 ${visible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
      style={{ left: `${det.x}%`, top: `${det.y}%`, width: `${det.w}%`, height: `${det.h}%` }}
    >
      <div className="absolute inset-0 rounded-md"
        style={{ border: `1.5px solid ${color}`, boxShadow: `0 0 8px ${color}55, inset 0 0 8px ${color}11` }}
      />
      {["top-0 left-0 border-t border-l rounded-tl-md","top-0 right-0 border-t border-r rounded-tr-md",
        "bottom-0 left-0 border-b border-l rounded-bl-md","bottom-0 right-0 border-b border-r rounded-br-md",
      ].map((cls, i) => (
        <div key={i} className={`absolute w-2.5 h-2.5 ${cls}`}
          style={{ borderColor: color, borderWidth: "2px" }} />
      ))}
      <div className="absolute -top-6 left-0 flex items-center gap-1.5 px-2 py-0.5 rounded-t-md text-[10px] font-bold text-black whitespace-nowrap"
        style={{ backgroundColor: color }}>
        <span>{det.label}</span>
        <span className="opacity-70">{det.confidence.toFixed(1)}%</span>
      </div>
    </div>
  );
}

// ─── CameraPreview ────────────────────────────────────────────────────────────

export default function CameraPreview({
  streamUrl = process.env.NEXT_PUBLIC_PI_STREAM_URL ?? "",
  nodeId = "rpi-node-01",
  wsUrl  = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:4000",
  temperature = 28,
  speed = 15,
  fps = 15,
}: CameraPreviewProps) {

  // ── State ──────────────────────────────────────────────────────────────────
  const [scanPos,      setScanPos]      = useState(0);
  const [boxVisible,   setBoxVisible]   = useState(false);
  const [frameCount,   setFrameCount]   = useState(0);
  const [pulseRing,    setPulseRing]    = useState(false);
  const [streamError,  setStreamError]  = useState(false);
  const [wsConnected,  setWsConnected]  = useState(false);

  // Data live dari broadcast Express
  const [harvest, setHarvest] = useState<HarvestUpdate | null>(null);

  // Bounding box dummy untuk overlay visual
  // Diganti real data jika model sudah kirim koordinat bbox
  const [detections, setDetections] = useState<Detection[]>([]);

  const wsRef = useRef<WebSocket | null>(null);

  // ── WebSocket: terima broadcast dari Express ───────────────────────────────
  useEffect(() => {
    if (!wsUrl) return;

    const connect = () => {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setWsConnected(true);
        console.log("[WS] Connected ke Express broadcast");
      };

      ws.onclose = () => {
        setWsConnected(false);
        // Auto-reconnect setelah 3 detik
        setTimeout(connect, 3000);
      };

      ws.onerror = (e) => console.error("[WS] Error:", e);

      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);

          // Terima broadcast dari Express broadcast()
          // format: { type: "harvest_update", payload: HarvestUpdate }
          if (msg.type === "harvest_update") {
            const data: HarvestUpdate = msg.payload;

            // Filter berdasarkan nodeId jika perlu
            if (data.nodeId === nodeId || !nodeId) {
              setHarvest(data);

              // Generate visual bounding boxes dummy berdasarkan count
              // Ganti dengan data bbox nyata jika model mengirimnya
              setDetections(buildDummyBoxes(data));
            }
          }
        } catch (err) {
          console.warn("[WS] Parse error:", err);
        }
      };
    };

    connect();
    return () => wsRef.current?.close();
  }, [wsUrl, nodeId]);

  // ── Scan line animation ────────────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => setScanPos((p) => p >= 100 ? 0 : p + 0.4), 16);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setBoxVisible(true), 600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setFrameCount((c) => c + 1), 1000 / fps);
    return () => clearInterval(id);
  }, [fps]);

  useEffect(() => {
    const id = setInterval(() => {
      setPulseRing(true);
      setTimeout(() => setPulseRing(false), 700);
    }, 2500);
    return () => clearInterval(id);
  }, []);

  // ── Derived state ──────────────────────────────────────────────────────────
  const totalDetected = harvest ? harvest.totalCount : 0;
  const primaryLabel  = harvest?.prepupaCount
    ? `PREPUPA ×${harvest.prepupaCount}`
    : harvest?.larvaCount
    ? `LARVA ×${harvest.larvaCount}`
    : "MENUNGGU...";
  const primaryConf   = 95.0; // pakai avg confidence jika dikirim dari Python

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="group relative rounded-3xl overflow-hidden bg-[#0c0c0e] border border-white/10
      shadow-[0_4px_40px_rgba(0,0,0,0.15)] hover:shadow-[0_8px_60px_rgba(163,230,53,0.08)]
      transition-shadow duration-500 opacity-0 animate-[fadeSlideUp_0.6s_ease_0.1s_forwards]">

      {/* ── Camera Viewport ── */}
      <div className="relative w-full aspect-[16/8] min-h-[220px] overflow-hidden">

        {/* MJPEG stream langsung dari Raspberry Pi */}
        {streamUrl && !streamError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={streamUrl}
            alt="BSF Live Camera"
            className="w-full h-full object-cover"
            onError={() => setStreamError(true)}
          />
        ) : (
          /* Placeholder saat stream belum ada */
          <div className="w-full h-full bg-[#0c0c0e] flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage: "linear-gradient(rgba(163,230,53,1) 1px, transparent 1px), linear-gradient(90deg, rgba(163,230,53,1) 1px, transparent 1px)",
                backgroundSize: "32px 32px",
              }} />
            <div className="absolute w-64 h-64 bg-lime-500/5 rounded-full blur-3xl top-0 left-1/4" />
            <div className="absolute w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl bottom-0 right-1/4" />
            <div className="flex flex-col items-center gap-2 text-center z-10">
              <div className="text-5xl opacity-20">🦟</div>
              <p className="text-xs text-gray-700 font-mono tracking-widest uppercase">
                {streamError ? "Stream error — cek IP Raspberry Pi" : `Menunggu stream... ${streamUrl || "set NEXT_PUBLIC_PI_STREAM_URL"}`}
              </p>
            </div>
          </div>
        )}

        {/* Scan line */}
        <div className="absolute left-0 right-0 h-px pointer-events-none"
          style={{
            top: `${scanPos}%`,
            background: "linear-gradient(90deg, transparent 0%, rgba(163,230,53,0.6) 30%, rgba(163,230,53,0.9) 50%, rgba(163,230,53,0.6) 70%, transparent 100%)",
            boxShadow: "0 0 10px rgba(163,230,53,0.5)",
          }} />

        {/* Bounding boxes overlay */}
        {detections.map((det) => (
          <BoundingBox key={det.id} det={det} visible={boxVisible} />
        ))}

        {/* ── Top-left: LIVE badge ── */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-bold tracking-widest text-white">
            <span className="relative flex w-2 h-2">
              <span className={`absolute inline-flex h-full w-full rounded-full bg-red-400 ${pulseRing ? "animate-ping" : ""} opacity-75`} />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            LIVE
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-mono text-gray-400">
            <Activity size={10} className="text-lime-400" />
            {fps} FPS
          </div>
          {/* WebSocket status */}
          <div className={`flex items-center gap-1 px-2 py-1.5 rounded-full bg-black/60 backdrop-blur-md border text-[10px] font-mono ${wsConnected ? "border-lime-400/30 text-lime-400" : "border-red-400/30 text-red-400"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${wsConnected ? "bg-lime-400" : "bg-red-400"}`} />
            {wsConnected ? "WS" : "WS OFF"}
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
            <span className="text-xs font-bold text-white font-mono">{speed}mm/s</span>
          </div>
        </div>

        {/* ── Bottom-left: detection count dari harvest ── */}
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
              {primaryConf.toFixed(1)}%{" "}
              <span className="text-lime-400">{primaryLabel}</span>
            </div>
          </div>
        </div>

        {/* Count chips */}
        {harvest && (
          <div className="flex items-center gap-2 flex-wrap">
            {harvest.prepupaCount > 0 && (
              <Chip label="PREPUPA" count={harvest.prepupaCount} color="#a3e635" />
            )}
            {harvest.larvaCount > 0 && (
              <Chip label="LARVA" count={harvest.larvaCount} color="#38bdf8" />
            )}
            {harvest.rejectCount > 0 && (
              <Chip label="REJECT" count={harvest.rejectCount} color="#f87171" />
            )}
          </div>
        )}

        {/* Model info */}
        <div className="flex items-center gap-2 text-[10px] font-mono text-gray-600">
          <Cpu size={10} className="text-gray-500" />
          <span>YOLOv8m · ONNX · {nodeId}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Helper: chip component ───────────────────────────────────────────────────
function Chip({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold font-mono"
      style={{ borderColor: `${color}33`, color, backgroundColor: `${color}0d` }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      {label} ×{count}
    </div>
  );
}

// ─── Helper: dummy bounding boxes dari harvest data ───────────────────────────
function buildDummyBoxes(h: HarvestUpdate): Detection[] {
  const boxes: Detection[] = [];
  for (let i = 0; i < Math.min(h.prepupaCount, 3); i++) {
    boxes.push({
      id: `prepupa-${i}`, label: "PREPUPA", confidence: 94 + i,
      x: 10 + i * 22, y: 20 + i * 10, w: 18, h: 14, color: "#a3e635",
    });
  }
  for (let i = 0; i < Math.min(h.larvaCount, 2); i++) {
    boxes.push({
      id: `larva-${i}`, label: "LARVA", confidence: 88 + i,
      x: 55 + i * 18, y: 40 + i * 12, w: 16, h: 12, color: "#38bdf8",
    });
  }
  return boxes;
}