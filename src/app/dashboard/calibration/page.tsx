"use client";

import { useState, useRef, useCallback } from "react";
import {
  Camera,
  SlidersHorizontal,
  Thermometer,
  Droplets,
  RotateCcw,
  Save,
  CheckCircle2,
  Sun,
  Contrast,
  Focus,
  Crop,
  Trash2,
} from "lucide-react";

import Card from "@/components/ui/Card";
import SliderControl from "@/components/ui/SliderControl";
import NumberStepper from "@/components/ui/NumberStepper";
import { useSetHeader } from "@/components/layout/HeaderContext";
import RoleGuard from "@/lib/RoleGuard";

// ─── Types ───────────────────────────────────────────────────────────────────

interface CameraParams {
  brightness: number;   // 0–100
  contrast: number;     // 0–100
  exposure: number;     // -10–10 (EV stops × 10, mapped to cv2 range)
  sharpness: number;    // 0–100
}

interface ROI {
  x: number;      // % from left
  y: number;      // % from top
  width: number;  // %
  height: number; // %
}

interface CalibrationState {
  camera: CameraParams;
  roi: ROI | null;
  maxTemp: number;
  minHumidity: number;
}

// ─── Defaults ────────────────────────────────────────────────────────────────

const DEFAULTS: CalibrationState = {
  camera: {
    brightness: 50,
    contrast: 50,
    exposure: 0,
    sharpness: 50,
  },
  roi: null,
  maxTemp: 32,
  minHumidity: 55,
};

// ─── ROI Selector Canvas ──────────────────────────────────────────────────────

interface ROISelectorProps {
  roi: ROI | null;
  onROIChange: (roi: ROI | null) => void;
}

function ROISelector({ roi, onROIChange }: ROISelectorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [tempROI, setTempROI] = useState<ROI | null>(null);

  const getRelative = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100)),
      y: Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100)),
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const pos = getRelative(e);
    setDragging(true);
    setDragStart(pos);
    setTempROI(null);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !dragStart) return;
    const pos = getRelative(e);
    const x = Math.min(dragStart.x, pos.x);
    const y = Math.min(dragStart.y, pos.y);
    const width = Math.abs(pos.x - dragStart.x);
    const height = Math.abs(pos.y - dragStart.y);
    if (width > 2 && height > 2) {
      setTempROI({ x, y, width, height });
    }
  };

  const handleMouseUp = () => {
    if (tempROI && tempROI.width > 5 && tempROI.height > 5) {
      onROIChange(tempROI);
    }
    setDragging(false);
    setDragStart(null);
    setTempROI(null);
  };

  const activeROI = dragging ? tempROI : roi;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Region of Interest
        </p>
        {roi && (
          <button
            onClick={() => onROIChange(null)}
            className="flex items-center gap-1 text-[10px] text-red-400 hover:text-red-600 font-semibold transition-colors"
          >
            <Trash2 size={10} />
            Clear ROI
          </button>
        )}
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 cursor-crosshair select-none"
        style={{ userSelect: "none" }}
      >
        {/* Scanline overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)`,
          }}
        />

        {/* Corner brackets */}
        {["top-2 left-2 border-l-2 border-t-2 rounded-tl-lg", "top-2 right-2 border-r-2 border-t-2 rounded-tr-lg", "bottom-2 left-2 border-l-2 border-b-2 rounded-bl-lg", "bottom-2 right-2 border-r-2 border-b-2 rounded-br-lg"].map((cls, i) => (
          <div key={i} className={`absolute w-5 h-5 border-lime-400 ${cls}`} />
        ))}

        {/* Label */}
        {!activeROI && !dragging && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <Crop size={20} className="text-white/30 mx-auto mb-2" />
              <p className="text-white/30 text-xs font-medium">Drag to define ROI</p>
              <p className="text-white/20 text-[10px] mt-0.5">Conveyor detection zone</p>
            </div>
          </div>
        )}

        {/* LIVE badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/50 rounded-full px-2.5 py-1 pointer-events-none">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
          <span className="text-white text-[10px] font-semibold tracking-widest">LIVE</span>
        </div>

        {/* Dim overlay outside ROI */}
        {activeROI && (
          <>
            {/* top */}
            <div className="absolute bg-black/40 pointer-events-none" style={{ top: 0, left: 0, right: 0, height: `${activeROI.y}%` }} />
            {/* bottom */}
            <div className="absolute bg-black/40 pointer-events-none" style={{ bottom: 0, left: 0, right: 0, top: `${activeROI.y + activeROI.height}%` }} />
            {/* left */}
            <div className="absolute bg-black/40 pointer-events-none" style={{ top: `${activeROI.y}%`, left: 0, width: `${activeROI.x}%`, height: `${activeROI.height}%` }} />
            {/* right */}
            <div className="absolute bg-black/40 pointer-events-none" style={{ top: `${activeROI.y}%`, right: 0, left: `${activeROI.x + activeROI.width}%`, height: `${activeROI.height}%` }} />

            {/* ROI box */}
            <div
              className="absolute border-2 border-lime-400 pointer-events-none"
              style={{
                left: `${activeROI.x}%`,
                top: `${activeROI.y}%`,
                width: `${activeROI.width}%`,
                height: `${activeROI.height}%`,
              }}
            >
              {/* Corner handles */}
              {["top-0 left-0 -translate-x-1/2 -translate-y-1/2", "top-0 right-0 translate-x-1/2 -translate-y-1/2", "bottom-0 left-0 -translate-x-1/2 translate-y-1/2", "bottom-0 right-0 translate-x-1/2 translate-y-1/2"].map((cls, i) => (
                <div key={i} className={`absolute w-2.5 h-2.5 bg-lime-400 rounded-sm transform ${cls}`} />
              ))}
              {/* Label */}
              <div className="absolute -top-5 left-0 bg-lime-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm whitespace-nowrap">
                ROI · {Math.round(activeROI.width)}% × {Math.round(activeROI.height)}%
              </div>
            </div>
          </>
        )}
      </div>

      {/* ROI info */}
      {roi && (
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "X", value: `${Math.round(roi.x)}%` },
            { label: "Y", value: `${Math.round(roi.y)}%` },
            { label: "W", value: `${Math.round(roi.width)}%` },
            { label: "H", value: `${Math.round(roi.height)}%` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-2 text-center border border-gray-100">
              <p className="text-[9px] text-gray-400 font-semibold uppercase">{label}</p>
              <p className="text-xs font-bold text-gray-700 font-mono">{value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CalibrationPage() {
  const [config, setConfig] = useState<CalibrationState>(DEFAULTS);
  const [saved, setSaved] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const updateCamera = (key: keyof CameraParams, value: number) => {
    setConfig((prev) => ({ ...prev, camera: { ...prev.camera, [key]: value } }));
    setHasChanges(true);
    setSaved(false);
  };

  const updateROI = (roi: ROI | null) => {
    setConfig((prev) => ({ ...prev, roi }));
    setHasChanges(true);
    setSaved(false);
  };

  const handleReset = () => {
    setConfig(DEFAULTS);
    setHasChanges(false);
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setHasChanges(false);
    setTimeout(() => setSaved(false), 3000);
  };

  useSetHeader({
    titleIcon: "⚙️",
    title: "Calibration & System Parameters",
    subtitle: "Configure camera, detection zone, and environmental safety limits.",
    breadcrumbs: [{ label: "EntoSort" }, { label: "Dashboard" }, { label: "Calibration" }],
    pollInterval: 30_000,
    actions: (
      <div className="flex items-center gap-2">
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-gray-200/80 text-gray-500 text-xs font-semibold hover:bg-gray-50 hover:text-gray-700 hover:border-gray-300 transition-all duration-200 hover:scale-105 shadow-sm"
        >
          <RotateCcw size={13} strokeWidth={2.5} />
          Reset
        </button>
      </div>
    ),
  });

  return (
    <RoleGuard allowedRoles={["admin", "operator"]}>
      <div className="pb-28">

        {/* ── Section 1: Camera Parameters ── */}
        <section className="mb-6 opacity-0 animate-[fadeSlideUp_0.5s_ease_0.1s_forwards]">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-lime-50 flex items-center justify-center">
              <Camera size={16} className="text-lime-600" />
            </div>
            <div>
              <h2 className="text-base font-black text-gray-900" style={{ fontFamily: "'Sora', sans-serif" }}>
                Camera & Detection Zone
              </h2>
              <p className="text-xs text-gray-500">Adjust image quality and conveyor scan area</p>
            </div>
          </div>

          <Card variant="default" padding="none" className="overflow-hidden border border-gray-100/80 shadow-[0_2px_20px_rgba(0,0,0,0.05)] rounded-3xl">
            <div className="flex flex-col lg:flex-row">

              {/* Left: ROI Selector */}
              <div className="lg:w-96 flex-shrink-0 p-6 border-b lg:border-b-0 lg:border-r border-gray-100">
                <ROISelector roi={config.roi} onROIChange={updateROI} />
              </div>

              {/* Right: Camera sliders */}
              <div className="flex-1 p-6 space-y-6">
                {/* Brightness */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                      <Sun size={14} className="text-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800" style={{ fontFamily: "'Sora', sans-serif" }}>Brightness</p>
                      <p className="text-[10px] text-gray-400">cv2.CAP_PROP_BRIGHTNESS</p>
                    </div>
                  </div>
                  <SliderControl
                    label="Level"
                    value={config.camera.brightness}
                    min={0}
                    max={100}
                    unit="%"
                    onChange={(v) => updateCamera("brightness", v)}
                  />
                </div>

                <div className="h-px bg-gray-100" />

                {/* Contrast */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center">
                      <Contrast size={14} className="text-slate-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800" style={{ fontFamily: "'Sora', sans-serif" }}>Contrast</p>
                      <p className="text-[10px] text-gray-400">cv2.CAP_PROP_CONTRAST</p>
                    </div>
                  </div>
                  <SliderControl
                    label="Level"
                    value={config.camera.contrast}
                    min={0}
                    max={100}
                    unit="%"
                    onChange={(v) => updateCamera("contrast", v)}
                  />
                </div>

                <div className="h-px bg-gray-100" />

                {/* Exposure */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Focus size={14} className="text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800" style={{ fontFamily: "'Sora', sans-serif" }}>Exposure</p>
                      <p className="text-[10px] text-gray-400">cv2.CAP_PROP_EXPOSURE</p>
                    </div>
                  </div>
                  <SliderControl
                    label="EV"
                    value={config.camera.exposure}
                    min={-10}
                    max={10}
                    onChange={(v) => updateCamera("exposure", v)}
                  />
                  {/* EV indicator */}
                  <div className="flex justify-center mt-2">
                    <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${
                      config.camera.exposure > 0
                        ? "bg-amber-50 text-amber-600"
                        : config.camera.exposure < 0
                        ? "bg-blue-50 text-blue-600"
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      {config.camera.exposure > 0 ? "+" : ""}{config.camera.exposure} EV
                    </span>
                  </div>
                </div>

                <div className="h-px bg-gray-100" />

                {/* Sharpness */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center">
                      <Focus size={14} className="text-purple-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800" style={{ fontFamily: "'Sora', sans-serif" }}>Sharpness</p>
                      <p className="text-[10px] text-gray-400">cv2.CAP_PROP_SHARPNESS</p>
                    </div>
                  </div>
                  <SliderControl
                    label="Level"
                    value={config.camera.sharpness}
                    min={0}
                    max={100}
                    unit="%"
                    onChange={(v) => updateCamera("sharpness", v)}
                  />
                </div>

                {/* Preview summary chips */}
                <div className="pt-2 flex flex-wrap gap-2">
                  {[
                    { label: "Brightness", value: config.camera.brightness, unit: "%" },
                    { label: "Contrast", value: config.camera.contrast, unit: "%" },
                    { label: "Exposure", value: config.camera.exposure, unit: " EV", sign: true },
                    { label: "Sharpness", value: config.camera.sharpness, unit: "%" },
                  ].map(({ label, value, unit, sign }) => (
                    <div key={label} className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-xl px-3 py-1.5">
                      <span className="text-[10px] text-gray-400 font-semibold">{label}</span>
                      <span className="text-xs font-bold text-gray-700 font-mono">
                        {sign && value > 0 ? "+" : ""}{value}{unit}
                      </span>
                    </div>
                  ))}
                  {config.roi && (
                    <div className="flex items-center gap-1.5 bg-lime-50 border border-lime-100 rounded-xl px-3 py-1.5">
                      <Crop size={10} className="text-lime-600" />
                      <span className="text-[10px] text-lime-600 font-semibold">ROI Active</span>
                      <span className="text-xs font-bold text-lime-700 font-mono">
                        {Math.round(config.roi.width)}×{Math.round(config.roi.height)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* ── Section 2: Environmental Thresholds ── */}
        <section className="mb-8 opacity-0 animate-[fadeSlideUp_0.5s_ease_0.25s_forwards]">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
              <SlidersHorizontal size={16} className="text-amber-600" />
            </div>
            <div>
              <h2 className="text-base font-black text-gray-900" style={{ fontFamily: "'Sora', sans-serif" }}>
                Environmental Thresholds
              </h2>
              <p className="text-xs text-gray-500">Safety limits for larva habitat monitoring</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <NumberStepper
              label="Max Temperature"
              value={config.maxTemp}
              min={20} max={45} step={1} unit="°C"
              description="Alert when temperature exceeds this value"
              onChange={(v) => { setConfig((p) => ({ ...p, maxTemp: v })); setHasChanges(true); }}
              accent="amber"
            />
            <NumberStepper
              label="Min Humidity"
              value={config.minHumidity}
              min={20} max={90} step={5} unit="%"
              description="Alert when humidity drops below this value"
              onChange={(v) => { setConfig((p) => ({ ...p, minHumidity: v })); setHasChanges(true); }}
              accent="blue"
            />
          </div>

          <Card variant="default" padding="md" className="mt-4 border border-gray-100/80 shadow-[0_2px_20px_rgba(0,0,0,0.05)] rounded-3xl">
            <div className="flex flex-wrap gap-6 items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Thermometer size={18} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold">Temperature Limit</p>
                  <p className="text-xl font-black text-gray-900" style={{ fontFamily: "'Sora', sans-serif" }}>
                    {config.maxTemp}<span className="text-sm font-semibold text-gray-400 ml-1">°C max</span>
                  </p>
                </div>
              </div>

              <div className="w-px h-10 bg-gray-100 hidden sm:block" />

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Droplets size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold">Humidity Floor</p>
                  <p className="text-xl font-black text-gray-900" style={{ fontFamily: "'Sora', sans-serif" }}>
                    {config.minHumidity}<span className="text-sm font-semibold text-gray-400 ml-1">% min</span>
                  </p>
                </div>
              </div>

              <div className="flex-1 hidden lg:flex items-center justify-end">
                {hasChanges && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 text-xs font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    Unsaved changes
                  </span>
                )}
                {saved && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-lime-50 border border-lime-100 text-lime-700 text-xs font-bold">
                    <CheckCircle2 size={14} />
                    Saved successfully
                  </span>
                )}
              </div>
            </div>
          </Card>
        </section>

        {/* ── Fixed bottom action bar ── */}
        <div className="fixed bottom-0 left-24 right-0 z-40 pb-6 pointer-events-none opacity-0 animate-[fadeSlideUp_0.5s_ease_0.4s_forwards]">
          <div className="max-w-[1280px] mx-auto px-6 pointer-events-auto">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_-4px_25px_rgba(0,0,0,0.05)] border border-gray-200/60 px-5 py-3.5 flex items-center justify-between gap-4 transition-all duration-300 hover:bg-white/95">
              <div className="hidden sm:flex items-center gap-2">
                {saved ? (
                  <span className="flex items-center gap-1.5 text-lime-600 text-sm font-bold">
                    <CheckCircle2 size={16} strokeWidth={2.5} />
                    Configuration saved
                  </span>
                ) : hasChanges ? (
                  <span className="flex items-center gap-1.5 text-amber-600 text-sm font-bold">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    You have unsaved changes
                  </span>
                ) : (
                  <span className="text-gray-400 text-sm font-semibold">No pending changes</span>
                )}
              </div>

              <div className="flex items-center gap-3 ml-auto">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-600 text-xs font-bold hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm"
                >
                  <RotateCcw size={14} strokeWidth={2.5} />
                  Reset Default
                </button>
                <button
                  onClick={handleSave}
                  disabled={!hasChanges}
                  className={`
                    flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm
                    ${hasChanges
                      ? "bg-gray-900 text-white hover:bg-black hover:scale-[1.02] hover:shadow-md"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"}
                  `}
                >
                  <Save size={14} strokeWidth={2.5} />
                  Save Configuration
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </RoleGuard>
  );
}