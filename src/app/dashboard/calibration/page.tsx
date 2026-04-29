"use client";

import { useState } from "react";
import {
  Camera,
  SlidersHorizontal,
  Thermometer,
  Droplets,
  RotateCcw,
  Save,
  CheckCircle2,
  Bug,
  Layers,
} from "lucide-react";

import Sidebar from "@/components/Sidebar"; 
import Header from "@/components/PageHeader";
import Card from "@/components/Card";
import SliderControl from "@/components/SliderControl";
import NumberStepper from "@/components/NumberStepper";

type ColorTarget = "larva" | "prepupa";

interface HSVParams {
  hueMin: number;
  hueMax: number;
  satMin: number;
  satMax: number;
  valMin: number;
  valMax: number;
}

interface CalibrationState {
  larva: HSVParams;
  prepupa: HSVParams;
  maxTemp: number;
  minHumidity: number;
}

const DEFAULTS: CalibrationState = {
  larva: { hueMin: 25, hueMax: 45, satMin: 80, satMax: 255, valMin: 60, valMax: 200 },
  prepupa: { hueMin: 10, hueMax: 25, satMin: 100, satMax: 255, valMin: 40, valMax: 180 },
  maxTemp: 32,
  minHumidity: 55,
};

function hsvToRgb(h: number, s: number, v: number): string {
  const hNorm = (h / 180) * 360;
  const sNorm = s / 255;
  const vNorm = v / 255;
  const c = vNorm * sNorm;
  const x = c * (1 - Math.abs(((hNorm / 60) % 2) - 1));
  const m = vNorm - c;
  let r = 0, g = 0, b = 0;
  if (hNorm < 60) { r = c; g = x; }
  else if (hNorm < 120) { r = x; g = c; }
  else if (hNorm < 180) { g = c; b = x; }
  else if (hNorm < 240) { g = x; b = c; }
  else if (hNorm < 300) { r = x; b = c; }
  else { r = c; b = x; }
  return `rgb(${Math.round((r + m) * 255)},${Math.round((g + m) * 255)},${Math.round((b + m) * 255)})`;
}

export default function CalibrationPage() {
  const [config, setConfig] = useState<CalibrationState>(DEFAULTS);
  const [activeColor, setActiveColor] = useState<ColorTarget>("larva");
  const [saved, setSaved] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const updateHSV = (target: ColorTarget, key: keyof HSVParams, value: number) => {
    setConfig((prev) => ({
      ...prev,
      [target]: { ...prev[target], [key]: value },
    }));
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

  const larvaColor = hsvToRgb(
    (config.larva.hueMin + config.larva.hueMax) / 2,
    (config.larva.satMin + config.larva.satMax) / 2,
    (config.larva.valMin + config.larva.valMax) / 2
  );

  const prepupaColor = hsvToRgb(
    (config.prepupa.hueMin + config.prepupa.hueMax) / 2,
    (config.prepupa.satMin + config.prepupa.satMax) / 2,
    (config.prepupa.valMin + config.prepupa.valMax) / 2
  );

  const activeParams = config[activeColor];

  return (
    <>
      {/* ── Global styles disamakan dengan Dashboard ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800;900&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .dashboard-root {
          font-family: 'DM Sans', system-ui, sans-serif;
          background: #f4f5f7;
          min-height: 100vh;
        }
      `}</style>

      <div className="dashboard-root relative overflow-x-hidden">
        {/* ── Ambient background blobs ── */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden -z-0">
          <div className="absolute -top-40 -left-32 w-[520px] h-[520px] rounded-full bg-lime-100/25 blur-[130px]" />
          <div className="absolute top-1/2 -right-48 w-[400px] h-[400px] rounded-full bg-emerald-100/18 blur-[110px]" />
          <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[480px] h-[220px] rounded-full bg-lime-50/35 blur-[90px]" />
        </div>

        <Sidebar />

        <main
          className="relative z-10 min-h-screen pb-28" 
          style={{ paddingLeft: "calc(68px + 2rem)" }}
        >
          {/* DI SINI PERUBAHAN UKURANNYA: max-w-[1280px] dan px-6 */}
          <div className="max-w-[1280px] w-full mx-auto px-6 py-8">
            <Header
              titleIcon="⚙️"
              title="Calibration & System Parameters"
              subtitle="Configure AI detection thresholds and environmental safety limits"
              breadcrumbs={[{ label: "EntoSort" }, { label: "Calibration" }]}
              status="online"
              animationDelay={0}
            />

            {/* Section 1: Camera & AI Calibration */}
            <section className="mb-6 mt-8 opacity-0 animate-[fadeSlideUp_0.5s_ease_0.2s_forwards]">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-lime-50 flex items-center justify-center">
                  <Camera size={16} className="text-lime-600" />
                </div>
                <div>
                  <h2 className="text-base font-black text-gray-900" style={{ fontFamily: "'Sora', sans-serif" }}>
                    Camera & AI Calibration
                  </h2>
                  <p className="text-xs text-gray-500">HSV color range detection settings</p>
                </div>
              </div>

              <Card variant="default" padding="none" className="overflow-hidden border border-gray-100/80 shadow-[0_2px_20px_rgba(0,0,0,0.05)] rounded-3xl">
                <div className="flex flex-col lg:flex-row">
                  {/* Left: Camera preview */}
                  <div className="lg:w-80 flex-shrink-0 p-6 border-b lg:border-b-0 lg:border-r border-gray-100">
                    {/* Camera placeholder */}
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-900 mb-5 shadow-sm border border-slate-800">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-3">
                            <Camera size={22} className="text-white/60" />
                          </div>
                          <p className="text-white/40 text-xs font-medium tracking-wide">
                            LIVE FEED
                          </p>
                          <p className="text-white/20 text-[10px] mt-1">CAM-01 · 1280×720</p>
                        </div>
                      </div>

                      {/* Scanline effect overlay */}
                      <div
                        className="absolute inset-0 pointer-events-none opacity-10"
                        style={{
                          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)`,
                        }}
                      />

                      {/* Corner brackets */}
                      {[
                        "top-2 left-2 border-l-2 border-t-2 rounded-tl-lg",
                        "top-2 right-2 border-r-2 border-t-2 rounded-tr-lg",
                        "bottom-2 left-2 border-l-2 border-b-2 rounded-bl-lg",
                        "bottom-2 right-2 border-r-2 border-b-2 rounded-br-lg",
                      ].map((cls, i) => (
                        <div key={i} className={`absolute w-5 h-5 border-lime-400 ${cls}`} />
                      ))}

                      {/* Live indicator */}
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/50 rounded-full px-2.5 py-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                        <span className="text-white text-[10px] font-semibold tracking-widest">LIVE</span>
                      </div>
                    </div>

                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                      Detection Target
                    </p>

                    {/* Color selectors */}
                    <div className="space-y-2.5">
                      {(["larva", "prepupa"] as ColorTarget[]).map((target) => {
                        const previewColor = target === "larva" ? larvaColor : prepupaColor;
                        const isActive = activeColor === target;
                        const Icon = target === "larva" ? Bug : Layers;

                        return (
                          <button
                            key={target}
                            onClick={() => setActiveColor(target)}
                            className={`
                              w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all duration-200
                              ${isActive
                                ? "border-lime-500 bg-lime-50/50 shadow-sm"
                                : "border-gray-100 bg-gray-50/50 hover:border-gray-200 hover:bg-white"
                              }
                            `}
                          >
                            <div className="relative flex-shrink-0">
                              <div
                                className="w-10 h-10 rounded-xl shadow-sm border border-white"
                                style={{ backgroundColor: previewColor }}
                              />
                              {isActive && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-lime-500 rounded-full flex items-center justify-center shadow-sm">
                                  <CheckCircle2 size={10} className="text-white" />
                                </div>
                              )}
                            </div>

                            <div className="text-left flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <Icon size={12} className={isActive ? "text-lime-600" : "text-gray-400"} />
                                <p className={`text-sm font-semibold capitalize ${isActive ? "text-lime-800" : "text-gray-700"}`}>
                                  {target}
                                </p>
                              </div>
                              <p className="text-[10px] text-gray-400 mt-0.5 font-mono">
                                H: {config[target].hueMin}–{config[target].hueMax}
                              </p>
                            </div>

                            <div
                              className="w-2 h-8 rounded-full flex-shrink-0 opacity-40"
                              style={{
                                background: `linear-gradient(to bottom, ${hsvToRgb(config[target].hueMin, 200, 180)}, ${hsvToRgb(config[target].hueMax, 200, 180)})`,
                              }}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right: HSV sliders */}
                  <div className="flex-1 p-6">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h3 className="text-sm font-black text-gray-900 capitalize" style={{ fontFamily: "'Sora', sans-serif" }}>
                          {activeColor} HSV Range
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Hue · Saturation · Value thresholds
                        </p>
                      </div>
                      <div
                        className="w-6 h-6 rounded-lg shadow-sm border border-white"
                        style={{ backgroundColor: activeColor === "larva" ? larvaColor : prepupaColor }}
                      />
                    </div>

                    {/* Hue section */}
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex-1 h-3 rounded-full shadow-inner overflow-hidden border border-black/5"
                          style={{
                            background: "linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)",
                          }}
                        />
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide w-12 text-right">
                          Hue
                        </span>
                      </div>
                      <div className="space-y-4">
                        <SliderControl
                          label="Hue Min"
                          value={activeParams.hueMin}
                          min={0}
                          max={180}
                          onChange={(v) => updateHSV(activeColor, "hueMin", v)}
                          colorHint={hsvToRgb(activeParams.hueMin, 200, 180)}
                        />
                        <SliderControl
                          label="Hue Max"
                          value={activeParams.hueMax}
                          min={0}
                          max={180}
                          onChange={(v) => updateHSV(activeColor, "hueMax", v)}
                          colorHint={hsvToRgb(activeParams.hueMax, 200, 180)}
                        />
                      </div>
                    </div>

                    {/* Saturation section */}
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                          Saturation
                        </span>
                        <div className="flex-1 h-px bg-gray-200" />
                      </div>
                      <div className="space-y-4">
                        <SliderControl
                          label="Sat Min"
                          value={activeParams.satMin}
                          min={0}
                          max={255}
                          onChange={(v) => updateHSV(activeColor, "satMin", v)}
                        />
                        <SliderControl
                          label="Sat Max"
                          value={activeParams.satMax}
                          min={0}
                          max={255}
                          onChange={(v) => updateHSV(activeColor, "satMax", v)}
                        />
                      </div>
                    </div>

                    {/* Value section */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                          Value (Brightness)
                        </span>
                        <div className="flex-1 h-px bg-gray-200" />
                      </div>
                      <div className="space-y-4">
                        <SliderControl
                          label="Val Min"
                          value={activeParams.valMin}
                          min={0}
                          max={255}
                          onChange={(v) => updateHSV(activeColor, "valMin", v)}
                        />
                        <SliderControl
                          label="Val Max"
                          value={activeParams.valMax}
                          min={0}
                          max={255}
                          onChange={(v) => updateHSV(activeColor, "valMax", v)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </section>

            {/* Section 2: Environmental Thresholds */}
            <section className="mb-8 opacity-0 animate-[fadeSlideUp_0.5s_ease_0.35s_forwards]">
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
                  min={20}
                  max={45}
                  step={1}
                  unit="°C"
                  description="Alert when temperature exceeds this value"
                  onChange={(v) => {
                    setConfig((p) => ({ ...p, maxTemp: v }));
                    setHasChanges(true);
                  }}
                  accent="amber"
                />
                <NumberStepper
                  label="Min Humidity"
                  value={config.minHumidity}
                  min={20}
                  max={90}
                  step={5}
                  unit="%"
                  description="Alert when humidity drops below this value"
                  onChange={(v) => {
                    setConfig((p) => ({ ...p, minHumidity: v }));
                    setHasChanges(true);
                  }}
                  accent="blue"
                />
              </div>

              {/* Environmental summary card */}
              <Card variant="default" padding="md" className="mt-4 border border-gray-100/80 shadow-[0_2px_20px_rgba(0,0,0,0.05)] rounded-3xl">
                <div className="flex flex-wrap gap-6 items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                      <Thermometer size={18} className="text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold">Temperature Limit</p>
                      <p className="text-xl font-black text-gray-900" style={{ fontFamily: "'Sora', sans-serif" }}>
                        {config.maxTemp}
                        <span className="text-sm font-semibold text-gray-400 ml-1">°C max</span>
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
                        {config.minHumidity}
                        <span className="text-sm font-semibold text-gray-400 ml-1">% min</span>
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
          </div>

          {/* Fixed bottom action bar - Now aligns perfectly with max-w-[1280px] */}
          <div 
            className="fixed bottom-0 z-40 pb-6 pointer-events-none opacity-0 animate-[fadeSlideUp_0.5s_ease_0.5s_forwards]"
            style={{ left: "calc(68px + 2rem)", right: 0 }}
          >
            <div className="max-w-[1280px] mx-auto px-6 pointer-events-auto">
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_-4px_25px_rgba(0,0,0,0.05)] border border-gray-200/60 px-5 py-3.5 flex items-center justify-between gap-4 transition-all duration-300 hover:bg-white/95">
                <div className="flex items-center gap-3">
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
                      <span className="text-gray-400 text-sm font-semibold">
                        No pending changes
                      </span>
                    )}
                  </div>
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
                        ? 'bg-gray-900 text-white hover:bg-black hover:scale-[1.02] hover:shadow-md' 
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'}
                    `}
                  >
                    <Save size={14} strokeWidth={2.5} />
                    Save Configuration
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}