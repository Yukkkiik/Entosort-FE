"use client";

import { useState } from "react";
import { Eye, EyeOff, ShieldCheck, BarChart3, Loader2 } from "lucide-react";
import Image from "next/image";
import { useLogin } from "@/hooks/useAuth";

export default function LoginPage() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    remember: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    username: "",
    password: "",
  });

  const login = useLogin();

  const handleChange = (field: "username" | "password", value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validasi lokal
    const newErrors = { username: "", password: "" };
    if (!form.username.trim()) newErrors.username = "Username wajib diisi.";
    if (!form.password.trim()) newErrors.password = "Password wajib diisi.";
    setErrors(newErrors);
    if (newErrors.username || newErrors.password) return;

    // Hit API — redirect otomatis di onSuccess hook
    login.mutate({
      username: form.username,
      password: form.password,
    });
  };

  return (
    <main className="min-h-screen bg-[#f7f7f2] px-4 py-8 md:px-8">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-[32px] border border-black/5 bg-white shadow-[0_20px_80px_rgba(0,0,0,0.08)]">

        {/* ── Panel Kiri ── */}
        <div className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-[#f3f6ef] via-[#eef2e8] to-[#f8f8f5] p-10 lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -left-16 top-10 h-44 w-44 rounded-full bg-green-200/30 blur-3xl" />
          <div className="absolute bottom-10 right-0 h-56 w-56 rounded-full bg-lime-100/40 blur-3xl" />

          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm">
              <Image src="/image.png" alt="Logo" width={40} height={40} priority />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">EntoSort</p>
              <h1 className="text-lg font-semibold text-gray-900">Smart Monitoring System</h1>
            </div>
          </div>

          <div className="relative z-10 max-w-md">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-green-700">
              Welcome Back
            </p>
            <h2 className="text-4xl font-bold leading-tight text-gray-900">
              Monitor, control, and optimize your system in one place.
            </h2>
            <p className="mt-5 text-base leading-7 text-gray-600">
              Masuk untuk mengakses dashboard monitoring, melihat data real-time, dan mengelola sistem dengan aman dan efisien.
            </p>

            <div className="mt-10 space-y-4">
              <div className="flex items-start gap-3 rounded-2xl border border-white/70 bg-white/70 p-4 backdrop-blur-sm">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-green-700" />
                <div>
                  <h3 className="font-semibold text-gray-900">Secure Access</h3>
                  <p className="text-sm text-gray-600">Sistem login aman untuk mengelola akun dan data penting.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-2xl border border-white/70 bg-white/70 p-4 backdrop-blur-sm">
                <BarChart3 className="mt-0.5 h-5 w-5 text-green-700" />
                <div>
                  <h3 className="font-semibold text-gray-900">Real-time Monitoring</h3>
                  <p className="text-sm text-gray-600">Pantau kondisi dan performa sistem secara langsung.</p>
                </div>
              </div>
            </div>
          </div>

          <p className="relative z-10 text-sm text-gray-500">
            Built for a smarter and more efficient monitoring workflow.
          </p>
        </div>

        {/* ── Panel Kanan (Form) ── */}
        <div className="flex w-full justify-center bg-white px-6 pt-16 pb-10 sm:px-10 lg:w-1/2 lg:px-14">
          <div className="w-full max-w-md">
            <div className="mb-10 flex flex-col items-center text-center">
              <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-3xl bg-white shadow-md">
                <Image
                  src="/image.png"
                  alt="Logo"
                  width={72}
                  height={72}
                  priority
                  className="h-auto w-auto object-contain"
                />
              </div>
              <h2 className="text-4xl font-bold tracking-tight text-gray-950">Login</h2>
              <p className="mt-2 text-sm text-gray-500">
                Silakan masuk ke akun Anda untuk melanjutkan.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error dari API */}
              {login.isError && (
                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {(login.error as Error).message}
                </div>
              )}

              {/* Username */}
              <div>
                <label htmlFor="username" className="mb-2 block text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  placeholder="Masukkan username"
                  value={form.username}
                  onChange={(e) => handleChange("username", e.target.value)}
                  disabled={login.isPending}
                  className="w-full rounded-xl border text-gray-600 border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-green-700 focus:ring-4 focus:ring-green-100 disabled:opacity-50"
                />
                {errors.username && (
                  <p className="mt-2 text-sm text-red-500">{errors.username}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan password"
                    value={form.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    disabled={login.isPending}
                    className="w-full rounded-xl border text-gray-600 border-gray-200 bg-white px-4 py-3 pr-12 text-sm outline-none transition focus:border-green-700 focus:ring-4 focus:ring-green-100 disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-gray-800"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-500">{errors.password}</p>
                )}
              </div>

              {/* Remember me */}
              <div className="flex items-center justify-between gap-4 text-sm">
                <label className="flex cursor-pointer items-center gap-2 text-gray-600">
                  <input
                    type="checkbox"
                    checked={form.remember}
                    onChange={(e) => setForm((prev) => ({ ...prev, remember: e.target.checked }))}
                    className="h-4 w-4 rounded border-gray-300 text-green-700 focus:ring-green-600"
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  className="font-medium text-gray-500 transition hover:text-green-700"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={login.isPending}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-800 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-900 focus:outline-none focus:ring-4 focus:ring-green-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {login.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  "Masuk"
                )}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}