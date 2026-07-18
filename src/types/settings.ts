// types/settings.ts

// ─── Settings utama ───────────────────────────────────────────────────────────

export interface AppSettings {
  unitId:          string;
  // ESP32 settings
  irThreshold:     number | null;
  motorSpeedRpm:   number | null;
  solenoidDelayMs: number | null;
  manualMode:      boolean;
  motorOn:         boolean;
  solenoidOn:      boolean;
  // RPi / CV settings (HSV threshold untuk klasifikasi larva)
  hsvLowerH:       number | null;
  hsvLowerS:       number | null;
  hsvLowerV:       number | null;
  hsvUpperH:       number | null;
  hsvUpperS:       number | null;
  hsvUpperV:       number | null;
  // RPi - Kalibrasi Fisik Kamera
  camBrightness:   number | null;
  camContrast:     number | null;
  camExposure:     number | null;
  camSharpness:    number | null;
  // Relasi
  unit?: {
    unitId: string;
    status: "online" | "offline";
  };
}

// ─── Update payload (partial — boleh kirim sebagian) ─────────────────────────

export interface UpdateSettingsPayload {
  unitId:           string;
  irThreshold?:     number;
  motorSpeedRpm?:   number;
  solenoidDelayMs?: number;
  manualMode?:      boolean;
  motorOn?:         boolean;
  solenoidOn?:      boolean;
  hsvLowerH?:       number;
  hsvLowerS?:       number;
  hsvLowerV?:       number;
  hsvUpperH?:       number;
  hsvUpperS?:       number;
  hsvUpperV?:       number;
  camBrightness?:   number;
  camContrast?:     number;
  camExposure?:     number;
  camSharpness?:    number;
}

// ─── API responses ────────────────────────────────────────────────────────────

export interface SettingsResponse {
  success: boolean;
  data:    AppSettings;
}

export interface SettingsListResponse {
  success: boolean;
  data:    AppSettings[];
}
