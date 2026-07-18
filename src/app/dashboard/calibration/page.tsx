"use client";

import { useState, useCallback } from "react";
import {
  Camera,
  RotateCcw,
  Save,
  CheckCircle2,
  AlertCircle,
  Sun,
  Contrast,
  Focus,
  Loader2,
} from "lucide-react";

import Card from "@/components/ui/Card";
import SliderControl from "@/components/ui/SliderControl";
import UnitSelector from "@/components/control/unitSelector";
import { useSetHeader } from "@/components/layout/HeaderContext";
import RoleGuard from "@/lib/RoleGuard";
import { useUnits } from "@/hooks/useUnit";
import { useCurrentUser } from "@/hooks/useAuth";
import { useSettings, useUpdateSettings } from "@/hooks/useSettings";
import type { AppSettings } from "@/types/settings";
import type { UnitNode } from "@/types/unit";

// ─── Types ───────────────────────────────────────────────────────────────────

interface CameraParams {
  brightness: number;   // 0–100
  contrast: number;     // 0–100
  exposure: number;     // -10–10 (EV stops × 10, mapped to cv2 range)
  sharpness: number;    // 0–100
}

interface CalibrationState {
  camera: CameraParams;
}

// ─── Defaults ────────────────────────────────────────────────────────────────

const DEFAULTS: CalibrationState = {
  camera: {
    brightness: 50,
    contrast: 50,
    exposure: 0,
    sharpness: 50,
  },
};

const fromApi = (data: AppSettings): CalibrationState => ({
  camera: {
    brightness: data.camBrightness ?? DEFAULTS.camera.brightness,
    contrast:   data.camContrast   ?? DEFAULTS.camera.contrast,
    exposure:   data.camExposure   ?? DEFAULTS.camera.exposure,
    sharpness:  data.camSharpness  ?? DEFAULTS.camera.sharpness,
  },
});

const toApiPayload = (state: CalibrationState) => ({
  camBrightness: state.camera.brightness,
  camContrast:   state.camera.contrast,
  camExposure:   state.camera.exposure,
  camSharpness:  state.camera.sharpness,
});

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CalibrationPage() {
  const { role } = useCurrentUser();
  const isAdmin = role === "admin";

  const { units, isLoading: loadingUnits } = useUnits();

  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);

  const unitId =
    selectedUnitId ??
    units?.find((u) => u.status === "online")?.unitId ??
    units?.[0]?.unitId ??
    "";

  const selectedUnit                    = units?.find((u) => u.unitId === unitId);
  const raspiNode: UnitNode | undefined = selectedUnit?.nodes?.find(
    (n) => n.nodeType === "raspberry"
  );

  const {
    data: remoteSettings,
    isLoading: loadingSettings,
    isError,
    error: queryError,
  } = useSettings(unitId || undefined);

  const { mutateAsync: saveSettings, isPending: saving } = useUpdateSettings();

  const [config, setConfig] = useState<CalibrationState>(DEFAULTS);
  const [initialized, setInitialized] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  if (remoteSettings && !initialized) {
    setConfig(fromApi(remoteSettings));
    setInitialized(true);
  }

  const updateCamera = (key: keyof CameraParams, value: number) => {
    setConfig((prev) => ({ ...prev, camera: { ...prev.camera, [key]: value } }));
    setHasChanges(true);
    setSaved(false);
  };

  const handleReset = () => {
    setConfig(DEFAULTS);
    setHasChanges(true); 
    setSaved(false);
    setError(null);
  };

  const handleUnitChange = useCallback((newUnitId: string) => {
    setSelectedUnitId(newUnitId);
    setConfig(DEFAULTS);
    setInitialized(false);
    setHasChanges(false);
    setSaved(false);
    setError(null);
  }, []);

  const handleSave = async () => {
    if (!unitId) {
      setError("Unit tidak ditemukan — tidak bisa menyimpan.");
      return;
    }

    setError(null);
    try {
      await saveSettings({ unitId, ...toApiPayload(config) });
      setSaved(true);
      setHasChanges(false);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("[Calibration] save gagal:", err);
      setError(err instanceof Error ? err.message : "Gagal menyimpan konfigurasi.");
    }
  };

  useSetHeader({
    titleIcon: "⚙️",
    title: "Calibration & System Parameters",
    subtitle: "Configure camera image quality parameters.",
    breadcrumbs: [{ label: "EntoSort" }, { label: "Dashboard" }, { label: "Calibration" }],
    pollInterval: 30_000,
    actions: (
      <div className="flex items-center gap-2">
        <button
          onClick={handleReset}
          disabled={saving}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-gray-200/80 text-gray-500 text-xs font-semibold hover:bg-gray-50 hover:text-gray-700 hover:border-gray-300 transition-all duration-200 hover:scale-105 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RotateCcw size={13} strokeWidth={2.5} />
          Reset
        </button>
      </div>
    ),
  });

  if (loadingUnits || loadingSettings) {
    return (
      <RoleGuard allowedRoles={["admin", "operator"]}>
        <div className="flex items-center justify-center py-24">
          <Loader2 size={22} className="animate-spin text-gray-400" />
          <span className="ml-2 text-sm text-gray-400 font-medium">Memuat konfigurasi...</span>
        </div>
      </RoleGuard>
    );
  }

  if (!unitId) {
    return (
      <RoleGuard allowedRoles={["admin", "operator"]}>
        <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-700 text-xs font-semibold rounded-xl px-4 py-3">
          <AlertCircle size={14} />
          Tidak ada unit terdaftar di sistem — tidak ada yang bisa dikalibrasi.
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={["admin", "operator"]}>
      <div className="pb-28">

        {(error || isError) && (
          <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-100 text-red-700 text-xs font-semibold rounded-xl px-4 py-3">
            <AlertCircle size={14} />
            {error || (queryError instanceof Error ? queryError.message : "Gagal memuat konfigurasi saat ini.")}
          </div>
        )}

        {isAdmin && units && units.length > 0 && (
          <div className="mb-5">
            <UnitSelector
              units={units}
              selectedUnitId={unitId}
              node={raspiNode}
              nodeLabel="Target Unit (Raspberry Pi)"
              onChange={handleUnitChange}
              animationDelay={100}
            />
          </div>
        )}

        {/* ── Section: Camera Parameters ── */}
        <section className="mb-6 opacity-0 animate-[fadeSlideUp_0.5s_ease_0.1s_forwards]">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-lime-50 flex items-center justify-center">
              <Camera size={16} className="text-lime-600" />
            </div>
            <div>
              <h2 className="text-base font-black text-gray-900" style={{ fontFamily: "'Sora', sans-serif" }}>
                Camera Parameters
              </h2>
              <p className="text-xs text-gray-500">Adjust image quality for detection accuracy</p>
            </div>
          </div>

          <Card variant="default" padding="md" className="overflow-hidden border border-gray-100/80 shadow-[0_2px_20px_rgba(0,0,0,0.05)] rounded-3xl">
            <div className="space-y-6">
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
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-600 text-xs font-bold hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RotateCcw size={14} strokeWidth={2.5} />
                  Reset Default
                </button>
                <button
                  onClick={handleSave}
                  disabled={!hasChanges || saving}
                  className={`
                    flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm
                    ${hasChanges && !saving
                      ? "bg-gray-900 text-white hover:bg-black hover:scale-[1.02] hover:shadow-md"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"}
                  `}
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} strokeWidth={2.5} />}
                  {saving ? "Saving..." : "Save Configuration"}
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </RoleGuard>
  );
}