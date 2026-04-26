"use client";

import { useEffect, useState } from "react";
import { Activity, Cpu, Zap, Radio, Eye } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Detection {
  id: string;
  label: string;
  confidence: number;
  /** Relative positions 0–100 (percent of container) */
  x: number;
  y: number;
  w: number;
  h: number;
  color?: string;
}

interface CameraPreviewProps {
  /** Pass a real image URL to replace the placeholder */
  imageUrl?: string;
  detections?: Detection[];
  temperature?: number;
  speed?: number;
  fps?: number;
  isLive?: boolean;
}

// ─── Default demo detections ──────────────────────────────────────────────────

const DEFAULT_DETECTIONS: Detection[] = [
  {
    id: "d1",
    label: "CREAM",
    confidence: 99.8,
    x: 30,
    y: 28,
    w: 22,
    h: 18,
    color: "#a3e635",
  },
  {
    id: "d2",
    label: "LARVA",
    confidence: 97.3,
    x: 58,
    y: 42,
    w: 18,
    h: 14,
    color: "#38bdf8",
  },
  {
    id: "d3",
    label: "PREPUPA",
    confidence: 95.1,
    x: 14,
    y: 54,
    w: 16,
    h: 12,
    color: "#f59e0b",
  },
];

// ─── BoundingBox ──────────────────────────────────────────────────────────────

function BoundingBox({ det, visible }: { det: Detection; visible: boolean }) {
  const color = det.color ?? "#a3e635";

  return (
    <div
      className={`absolute transition-all duration-500 ${
        visible ? "opacity-100 scale-100" : "opacity-0 scale-95"
      }`}
      style={{ left: `${det.x}%`, top: `${det.y}%`, width: `${det.w}%`, height: `${det.h}%` }}
    >
      {/* Box */}
      <div
        className="absolute inset-0 rounded-md"
        style={{
          border: `1.5px solid ${color}`,
          boxShadow: `0 0 8px ${color}55, inset 0 0 8px ${color}11`,
        }}
      />

      {/* Corner accents */}
      {[
        "top-0 left-0 border-t border-l rounded-tl-md",
        "top-0 right-0 border-t border-r rounded-tr-md",
        "bottom-0 left-0 border-b border-l rounded-bl-md",
        "bottom-0 right-0 border-b border-r rounded-br-md",
      ].map((cls, i) => (
        <div
          key={i}
          className={`absolute w-2.5 h-2.5 ${cls}`}
          style={{ borderColor: color, borderWidth: "2px" }}
        />
      ))}

      {/* Label chip */}
      <div
        className="absolute -top-6 left-0 flex items-center gap-1.5 px-2 py-0.5 rounded-t-md text-[10px] font-bold text-black whitespace-nowrap"
        style={{ backgroundColor: color }}
      >
        <span>{det.label}</span>
        <span className="opacity-70">{det.confidence.toFixed(1)}%</span>
      </div>
    </div>
  );
}

// ─── CameraPreview ────────────────────────────────────────────────────────────

export default function CameraPreview({
  imageUrl,
  detections = DEFAULT_DETECTIONS,
  temperature = 28,
  speed = 15,
  fps = 30,
  isLive = true,
}: CameraPreviewProps) {
  const [scanPos, setScanPos] = useState(0);
  const [boxVisible, setBoxVisible] = useState(false);
  const [frameCount, setFrameCount] = useState(0);
  const [pulseRing, setPulseRing] = useState(false);

  // Scan line animation
  useEffect(() => {
    const id = setInterval(() => {
      setScanPos((p) => (p >= 100 ? 0 : p + 0.4));
    }, 16);
    return () => clearInterval(id);
  }, []);

  // Bounding boxes appear after mount
  useEffect(() => {
    const t = setTimeout(() => setBoxVisible(true), 600);
    return () => clearTimeout(t);
  }, []);

  // Frame counter
  useEffect(() => {
    const id = setInterval(() => {
      setFrameCount((c) => c + 1);
    }, 1000 / fps);
    return () => clearInterval(id);
  }, [fps]);

  // Live pulse ring
  useEffect(() => {
    const id = setInterval(() => {
      setPulseRing(true);
      setTimeout(() => setPulseRing(false), 700);
    }, 2500);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="
        group relative rounded-3xl overflow-hidden
        bg-[#0c0c0e] border border-white/10
        shadow-[0_4px_40px_rgba(0,0,0,0.15)]
        hover:shadow-[0_8px_60px_rgba(163,230,53,0.08)]
        transition-shadow duration-500
        opacity-0 animate-[fadeSlideUp_0.6s_ease_0.1s_forwards]
      "
    >
      {/* ── Camera Viewport ── */}
      <div className="relative w-full aspect-[16/8] min-h-[220px] overflow-hidden">
        {/* Image / Placeholder */}
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt="Live camera feed"
            className="w-full h-full object-cover"
          />
        ) : (
          /* Placeholder: dark grid + floating larva emoji */
          <div className="w-full h-full bg-[#0c0c0e] flex items-center justify-center relative overflow-hidden">
            {/* Grid */}
            <div
              className="absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(163,230,53,1) 1px, transparent 1px), linear-gradient(90deg, rgba(163,230,53,1) 1px, transparent 1px)",
                backgroundSize: "32px 32px",
              }}
            />
            {/* Decorative blobs */}
            <div className="absolute w-64 h-64 bg-lime-500/5 rounded-full blur-3xl top-0 left-1/4" />
            <div className="absolute w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl bottom-0 right-1/4" />

            {/* Centre icon */}
            <div className="flex flex-col items-center gap-2 text-center z-10">
              <div className="text-5xl opacity-20">🦟</div>
              <p className="text-xs text-gray-700 font-mono tracking-widest uppercase">
                Camera Feed — Replace imageUrl prop
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

        {/* Bounding boxes */}
        {detections.map((det) => (
          <BoundingBox key={det.id} det={det} visible={boxVisible} />
        ))}

        {/* ── Top-left: LIVE badge ── */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <div
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-full
              bg-black/60 backdrop-blur-md border border-white/10
              text-[11px] font-bold tracking-widest text-white
            `}
          >
            {/* Pulse ring */}
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
          {isLive && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-mono text-gray-400">
              <Activity size={10} className="text-lime-400" />
              {fps} FPS
            </div>
          )}
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

        {/* ── Bottom-left: detection count ── */}
        <div className="absolute bottom-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-lime-400/20">
          <Eye size={11} className="text-lime-400" />
          <span className="text-[11px] font-bold text-lime-400 font-mono">
            {detections.length} DETECTED
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
        {/* Left: primary detection */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-lime-400/10 border border-lime-400/20 flex items-center justify-center">
            <Radio size={14} className="text-lime-400" />
          </div>
          <div>
            <div className="text-[10px] text-gray-600 uppercase tracking-widest font-semibold">
              Primary Detection
            </div>
            <div className="text-sm font-bold text-white font-mono">
              {detections[0]?.confidence.toFixed(1)}%{" "}
              <span className="text-lime-400">{detections[0]?.label}</span>
            </div>
          </div>
        </div>

        {/* Center: all detections chips */}
        <div className="flex items-center gap-2 flex-wrap">
          {detections.map((det) => (
            <div
              key={det.id}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold font-mono"
              style={{
                borderColor: `${det.color ?? "#a3e635"}33`,
                color: det.color ?? "#a3e635",
                backgroundColor: `${det.color ?? "#a3e635"}0d`,
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: det.color ?? "#a3e635" }}
              />
              {det.label} {det.confidence.toFixed(0)}%
            </div>
          ))}
        </div>

        {/* Right: model info */}
        <div className="flex items-center gap-2 text-[10px] font-mono text-gray-600">
          <Cpu size={10} className="text-gray-500" />
          <span>YOLOv8-nano · Edge TPU</span>
        </div>
      </div>
    </div>
  );
}