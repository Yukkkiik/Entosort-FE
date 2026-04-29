"use client";

import Sidebar from "@/components/Sidebar";
import PageHeader from "@/components/PageHeader";
import ReportsDashboard from "@/components/ReportsDashboard";

export default function ReportsPage() {
  return (
    <>
      {/* ── Global font + animation injection matching the Dashboard ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800;900&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&display=swap');

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
        {/* ── Background blobs ── */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-lime-200/20 blur-[120px]" />
          <div className="absolute top-1/2 -right-60 w-[400px] h-[400px] rounded-full bg-emerald-200/15 blur-[100px]" />
          <div className="absolute -bottom-40 left-1/3 w-[300px] h-[300px] rounded-full bg-lime-100/20 blur-[80px]" />
        </div>

        <Sidebar />

        <main
          className="relative z-10 min-h-screen"
          style={{ paddingLeft: "calc(68px + 2rem)" }}
        >
          {/* DI SINI PERUBAHAN UKURANNYA: max-w-[1280px] dan px-6 */}
          <div className="max-w-[1280px] mx-auto px-6 py-8 pb-16">
            <PageHeader
              titleIcon="📊"
              title="Larva History & Reports"
              subtitle="Digital production records and larva sorting history."
              breadcrumbs={[
                { label: "EntoSort" },
                { label: "Dashboard" },
                { label: "Reports" },
              ]}
              status="online"
              animationDelay={0}
            />

            {/* Wrapper untuk menambahkan animasi fade-up pada ReportsDashboard dan margin atas */}
            <div className="mt-6 opacity-0 animate-[fadeSlideUp_0.5s_ease_0.25s_forwards]">
              <ReportsDashboard />
            </div>
          </div>
        </main>
      </div>
    </>
  );
}