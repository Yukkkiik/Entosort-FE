"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/authStore";
import Sidebar from "@/components/layout/Sidebar";
import PageHeader from "@/components/layout/PageHeader";
import { HeaderProvider, useHeaderConfig } from "@/components/layout/HeaderContext";

// ─── DashboardInner ───────────────────────────────────────────────────────────

function DashboardInner({ children }: { children: React.ReactNode }) {
  const { config } = useHeaderConfig();

  return (
    <div className="min-h-screen bg-gray-50">
     
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800;900&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>

      <Sidebar />
      <main
        className="pl-24 pr-6 py-6"
        style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
      >
        <PageHeader {...config} />
        {children}
      </main>
    </div>
  );
}

// ─── DashboardLayout ──────────────────────────────────────────────────────────

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.replace("/login");
    }
  }, [hasHydrated, isAuthenticated, router]);

  if (!hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-lime-500 animate-spin" />
          <p className="text-sm text-gray-400">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <HeaderProvider>
      <DashboardInner>{children}</DashboardInner>
    </HeaderProvider>
  );
}