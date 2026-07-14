// components/profile/ProfilePage.tsx
"use client";

import { useState } from "react";
import {
  Lock, Eye, EyeOff, Check, Loader2, AlertCircle,
  ShieldCheck, User, Phone, KeyRound, CheckCircle2,
  Clock, Calendar, Activity, Cpu, Wifi,
} from "lucide-react";
import { useCurrentUser } from "@/hooks/useAuth";
import { useChangePassword } from "@/hooks/useAuth";

// ─── Password strength ────────────────────────────────────────────────────────

function getStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: "", color: "" };
  let score = 0;
  if (password.length >= 8)           score++;
  if (password.length >= 12)          score++;
  if (/[A-Z]/.test(password))         score++;
  if (/[0-9]/.test(password))         score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return { score, label: "Lemah",       color: "bg-red-400"     };
  if (score <= 2) return { score, label: "Cukup",       color: "bg-amber-400"   };
  if (score <= 3) return { score, label: "Sedang",      color: "bg-yellow-400"  };
  if (score <= 4) return { score, label: "Kuat",        color: "bg-emerald-400" };
  return            { score, label: "Sangat Kuat", color: "bg-green-500"   };
}

// ─── PasswordInput ────────────────────────────────────────────────────────────

function PasswordInput({
  value, onChange, placeholder, id,
}: {
  value: string; onChange: (v: string) => void; placeholder: string; id: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Lock size={13} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="new-password"
        className="w-full rounded-xl border text-gray-600 border-slate-200 py-2.5 pl-10 pr-11 text-sm outline-none transition-all focus:border-green-500 focus:ring-2 focus:ring-green-50"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
        tabIndex={-1}
      >
        {show ? <EyeOff size={13} /> : <Eye size={13} />}
      </button>
    </div>
  );
}

// ─── Avatar besar ─────────────────────────────────────────────────────────────

function BigAvatar({ username, role }: { username: string; role: string }) {
  const initials = username.slice(0, 2).toUpperCase();
  const gradients: Record<string, string> = {
    superadmin: "from-violet-500 to-purple-700",
    admin:      "from-blue-500 to-indigo-700",
    operator:   "from-emerald-500 to-green-700",
  };
  const grad = gradients[role] ?? gradients.operator;
  return (
    <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${grad} flex items-center justify-center shadow-xl`}>
      <span className="text-white text-2xl font-black">{initials}</span>
    </div>
  );
}

// ─── Info Row ─────────────────────────────────────────────────────────────────

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-slate-50 last:border-0">
      <div className="w-7 flex justify-center text-slate-400 flex-shrink-0">{icon}</div>
      <span className="w-28 text-xs text-slate-400 flex-shrink-0">{label}</span>
      <div className="text-sm font-medium text-slate-700">{value}</div>
    </div>
  );
}

// ─── Security Tip ─────────────────────────────────────────────────────────────

function SecurityTip({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
      <div className="mt-0.5 flex-shrink-0 text-slate-400">{icon}</div>
      <div>
        <p className="text-xs font-semibold text-slate-700">{title}</p>
        <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user }         = useCurrentUser();
  const changePassword   = useChangePassword();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword,     setNewPassword]     = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError,       setFormError]       = useState("");
  const [success,         setSuccess]         = useState(false);

  const strength        = getStrength(newPassword);
  const passwordsMatch  = confirmPassword.length > 0 && newPassword === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;

  const roleLabel: Record<string, string> = {
    superadmin: "Superadmin", admin: "Admin", operator: "Operator",
  };
  const roleColor: Record<string, string> = {
    superadmin: "border-purple-200 bg-purple-50 text-purple-700",
    admin:      "border-blue-200 bg-blue-50 text-blue-700",
    operator:   "border-lime-200 bg-lime-50 text-lime-700",
  };
  const accentBg =
    user?.role === "superadmin" ? "bg-purple-700"
    : user?.role === "admin"   ? "bg-blue-700"
    : "bg-green-700";

  const joinDate = user
    ? new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
    : "—";

  const now = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

  const handleSubmit = async () => {
    setFormError(""); setSuccess(false);
    if (!currentPassword.trim()) { setFormError("Password saat ini wajib diisi."); return; }
    if (!newPassword.trim())     { setFormError("Password baru wajib diisi."); return; }
    if (newPassword.length < 8)  { setFormError("Password baru minimal 8 karakter."); return; }
    if (newPassword !== confirmPassword) { setFormError("Konfirmasi password tidak cocok."); return; }
    if (currentPassword === newPassword) { setFormError("Password baru tidak boleh sama dengan password lama."); return; }
    try {
      await changePassword.mutateAsync({ currentPassword, newPassword });
      setSuccess(true);
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (err) {
      setFormError((err as Error).message ?? "Gagal mengubah password.");
    }
  };

  return (
    <div className="space-y-5">

      {/* ── Row 1: Hero card ───────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
        <div className={`px-8 py-6 ${
          user?.role === "superadmin" ? "bg-gradient-to-r from-purple-50 to-violet-50/40 border-b border-purple-100"
          : user?.role === "admin"   ? "bg-gradient-to-r from-blue-50 to-indigo-50/40 border-b border-blue-100"
          : "bg-gradient-to-r from-lime-50 to-emerald-50/40 border-b border-lime-100"
        }`}>
          <div className="flex items-center gap-6">
            <BigAvatar username={user?.username ?? "U"} role={user?.role ?? "operator"} />
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-black text-slate-900 truncate">{user?.username ?? "—"}</h2>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${roleColor[user?.role ?? "operator"]}`}>
                  <ShieldCheck size={11} />
                  {roleLabel[user?.role ?? "operator"]}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                  <Activity size={10} />
                  Sesi aktif
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-400">
                Kelola informasi akun dan keamanan Anda dari halaman ini.
              </p>
            </div>

            {/* Quick stats kanan */}
            <div className="hidden lg:flex items-center gap-4 flex-shrink-0">
              <div className="text-center px-5 py-3 rounded-2xl bg-white/70 border border-slate-100">
                <p className="text-lg font-black text-slate-800">{now}</p>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5 flex items-center gap-1 justify-center">
                  <Clock size={9} /> Waktu Login
                </p>
              </div>
              <div className="text-center px-5 py-3 rounded-2xl bg-white/70 border border-slate-100">
                <p className="text-lg font-black text-slate-800 uppercase">{user?.role?.slice(0, 2) ?? "—"}</p>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5 flex items-center gap-1 justify-center">
                  <ShieldCheck size={9} /> Level Akses
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 2: Info + Tips (kiri) | Ganti Password (kanan) ───────────── */}
      <div className="grid lg:grid-cols-5 gap-5 items-start">

        {/* Kolom kiri — col-span-2 */}
        <div className="lg:col-span-2 space-y-5">

          {/* Info detail */}
          <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50 px-5 py-4">
              <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl ${accentBg}`}>
                <User size={14} className="text-white" />
              </div>
              <p className="text-sm font-semibold text-slate-800">Informasi Akun</p>
            </div>
            <div className="px-5 py-2">
              <InfoRow
                icon={<User size={13} />}
                label="Username"
                value={<span className="font-mono">{user?.username ?? "—"}</span>}
              />
              <InfoRow
                icon={<Phone size={13} />}
                label="No. HP"
                value={<span className="font-mono">{user?.phone ?? "—"}</span>}
              />
              <InfoRow
                icon={<ShieldCheck size={13} />}
                label="Role"
                value={
                  <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-semibold ${roleColor[user?.role ?? "operator"]}`}>
                    {roleLabel[user?.role ?? "operator"]}
                  </span>
                }
              />
              <InfoRow
                icon={<Calendar size={13} />}
                label="Bergabung"
                value={joinDate}
              />
              <InfoRow
                icon={<Activity size={13} />}
                label="Status"
                value={
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Aktif
                  </span>
                }
              />
            </div>
          </div>

          {/* Tips keamanan */}
          <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50 px-5 py-4">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-slate-700">
                <ShieldCheck size={14} className="text-white" />
              </div>
              <p className="text-sm font-semibold text-slate-800">Tips Keamanan</p>
            </div>
            <div className="px-5 py-4 space-y-2.5">
              <SecurityTip
                icon={<KeyRound size={13} />}
                title="Gunakan password unik"
                desc="Jangan gunakan password yang sama dengan akun lain atau kata sandi yang mudah ditebak."
              />
              <SecurityTip
                icon={<Lock size={13} />}
                title="Minimal 12 karakter"
                desc="Password lebih panjang jauh lebih aman. Kombinasikan huruf, angka, dan simbol."
              />
              <SecurityTip
                icon={<Wifi size={13} />}
                title="Jaga kerahasiaan"
                desc="Jangan bagikan password ke siapapun, termasuk tim IT atau administrator sistem."
              />
              <SecurityTip
                icon={<Cpu size={13} />}
                title="Ganti berkala"
                desc="Disarankan mengganti password setiap 90 hari untuk menjaga keamanan akun."
              />
            </div>
          </div>
        </div>

        {/* Kolom kanan — col-span-3: Form ganti password */}
        <div className="lg:col-span-3 overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50 px-6 py-4">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-slate-700">
              <KeyRound size={15} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Ganti Password</p>
              <p className="mt-0.5 text-xs text-slate-400">
                Gunakan password yang kuat dan belum pernah dipakai sebelumnya
              </p>
            </div>
          </div>

          <div className="space-y-4 px-6 py-5">
            {success && (
              <div className="flex items-center gap-2.5 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-xs text-emerald-700">
                <CheckCircle2 size={14} className="flex-shrink-0" />
                Password berhasil diubah. Gunakan password baru untuk login berikutnya.
              </div>
            )}
            {(formError || changePassword.isError) && (
              <div className="flex items-center gap-2.5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs text-red-600">
                <AlertCircle size={13} className="flex-shrink-0" />
                {formError || (changePassword.error as Error)?.message || "Terjadi kesalahan."}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="current" className="block text-sm font-medium text-slate-700">
                Password Saat Ini
              </label>
              <PasswordInput id="current" value={currentPassword} onChange={setCurrentPassword} placeholder="Masukkan password saat ini"  />
            </div>

            <div className="h-px bg-slate-50" />

            <div className="space-y-1.5">
              <label htmlFor="new" className="block text-sm font-medium text-slate-700">
                Password Baru
              </label>
              <PasswordInput id="new" value={newPassword} onChange={setNewPassword} placeholder="Minimal 8 karakter" />
              {newPassword.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                          i <= strength.score ? strength.color : "bg-slate-100"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] text-slate-400">
                      Kekuatan: <span className="font-semibold text-slate-600">{strength.label}</span>
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {newPassword.length} karakter
                    </p>
                  </div>
                  {/* Checklist requirements */}
                  <div className="grid grid-cols-2 gap-1 pt-1">
                    {[
                      { ok: newPassword.length >= 8,           label: "Min. 8 karakter"   },
                      { ok: /[A-Z]/.test(newPassword),         label: "Huruf kapital"      },
                      { ok: /[0-9]/.test(newPassword),         label: "Mengandung angka"   },
                      { ok: /[^A-Za-z0-9]/.test(newPassword),  label: "Simbol (!@#...)"    },
                    ].map(({ ok, label }) => (
                      <div key={label} className={`flex items-center gap-1.5 text-[11px] font-medium ${ok ? "text-emerald-600" : "text-slate-400"}`}>
                        <CheckCircle2 size={10} className={ok ? "text-emerald-500" : "text-slate-200"} />
                        {label}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="confirm" className="block text-sm font-medium text-slate-700">
                Konfirmasi Password Baru
              </label>
              <PasswordInput id="confirm" value={confirmPassword} onChange={setConfirmPassword} placeholder="Ulangi password baru" />
              {passwordsMatch && (
                <p className="flex items-center gap-1 text-[11px] text-emerald-600">
                  <CheckCircle2 size={11} /> Password cocok
                </p>
              )}
              {passwordsMismatch && (
                <p className="flex items-center gap-1 text-[11px] text-red-500">
                  <AlertCircle size={11} /> Password tidak cocok
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-6 py-4">
            <p className="text-xs text-slate-400 max-w-xs">
              Setelah ganti password, gunakan password baru saat login berikutnya.
            </p>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={changePassword.isPending || passwordsMismatch}
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50 ${accentBg} hover:opacity-90`}
            >
              {changePassword.isPending ? (
                <><Loader2 size={14} className="animate-spin" /> Menyimpan...</>
              ) : (
                <><Check size={14} strokeWidth={2.5} /> Simpan Password</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}