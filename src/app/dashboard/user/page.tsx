"use client";

import Sidebar from "@/components/Sidebar";
import PageHeader from "@/components/PageHeader";
import StatsCard from "@/components/StatsCard";
import Card from "@/components/Card";
import UserTable from "@/components/UserTable";
import { Users, Wifi, UserCheck, ShieldCheck } from "lucide-react";

export default function UserPage() {
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
        {/* ── Background blobs (Disamakan dengan Dashboard) ── */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-lime-200/20 blur-[120px]" />
          <div className="absolute top-1/2 -right-60 w-[400px] h-[400px] rounded-full bg-emerald-200/15 blur-[100px]" />
          <div className="absolute -bottom-40 left-1/3 w-[300px] h-[300px] rounded-full bg-lime-100/20 blur-[80px]" />
        </div>

        {/* ── Sidebar ── */}
        <Sidebar />

        {/* ── Main content ── */}
        <main
          className="relative min-h-screen z-10"
          style={{ paddingLeft: "calc(68px + 2rem)" }}
        >
          {/* DI SINI PERUBAHAN UKURANNYA: max-w-[1280px] dan px-6 */}
          <div className="max-w-[1280px] mx-auto px-6 py-8 pb-16">
            
            {/* ── Header ── */}
            <PageHeader
              titleIcon="📊"
              title="User Management"
              subtitle="Kelola hak akses dan akun operator sistem."
              breadcrumbs={[
                { label: "EntoSort" },
                { label: "Dashboard" },
                { label: "Users" },
              ]}
              status="online"
              animationDelay={0}
            />

            {/* ── Stats ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 mb-6 opacity-0 animate-[fadeSlideUp_0.5s_ease_0.25s_forwards]">
              <StatsCard
                label="Total Accounts"
                value={5}
                icon={<Users size={18} />}
                accent="green"
                trend="up"
                trendValue="+1"
                trendLabel="Since last month"
              />
              <StatsCard
                label="Active Sessions"
                value={2}
                icon={<Wifi size={18} />}
                accent="blue"
                trend="neutral"
                trendValue="—"
                trendLabel="No change today"
              />
              <StatsCard
                label="Active Users"
                value={3}
                icon={<UserCheck size={18} />}
                accent="violet"
                trend="up"
                trendValue="60%"
                trendLabel="Of total accounts"
              />
              <StatsCard
                label="Admin Accounts"
                value={1}
                icon={<ShieldCheck size={18} />}
                accent="amber"
                trend="neutral"
                trendValue="—"
                trendLabel="No change"
              />
            </div>

            {/* ── User Table Card ── */}
            <Card 
              variant="default" 
              padding="md" 
              className="opacity-0 animate-[fadeSlideUp_0.5s_ease_0.4s_forwards] border-gray-100/80 shadow-[0_2px_20px_rgba(0,0,0,0.05)] rounded-3xl"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-50">
                <div>
                  <h2 
                    className="text-sm font-black text-gray-900" 
                    style={{ fontFamily: "'Sora', sans-serif" }}
                  >
                    All Users
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Click on a row or action buttons to manage users
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-lime-50 border border-lime-100 text-lime-700 text-[11px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-lime-500 animate-pulse" />
                    System Online
                  </span>
                </div>
              </div>
        
              <UserTable />
            </Card>
            
          </div>
        </main>
      </div>
    </>
  );
}