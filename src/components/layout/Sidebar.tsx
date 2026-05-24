"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  Sliders,
  Settings,
  LogOut,
  Leaf,
  User,
} from "lucide-react";
import { useCurrentUser, useLogout } from "@/hooks/useAuth";

export type UserRole = "admin" | "peternak";

interface NavItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  href?: string;
  badge?: number;
  roles: UserRole[];
}

interface SidebarProps {
  onNavChange?: (id: string) => void;
}

const ALL_NAV_ITEMS: NavItem[] = [
  {
    id: "dashboard",
    icon: <LayoutDashboard size={18} strokeWidth={2} />,
    label: "Dashboard",
    href: "/dashboard",
    roles: ["admin", "peternak"],
  },
  {
    id: "control",
    icon: <Sliders size={18} strokeWidth={2} />,
    label: "Manual Control",
    href: "/dashboard/control",
    roles: ["admin", "peternak"],
  },
  {
    id: "reports",
    icon: <BarChart3 size={18} strokeWidth={2} />,
    label: "Riwayat & Laporan",
    href: "/dashboard/reports",
    roles: ["admin", "peternak"],
  },
  {
    id: "user",
    icon: <User size={18} strokeWidth={2} />,
    label: "Manajemen Pengguna",
    href: "/dashboard/user",
    roles: ["admin"],
  },
  {
    id: "calibration",
    icon: <Settings size={18} strokeWidth={2} />,
    label: "Kalibrasi & Parameter Sistem",
    href: "/dashboard/calibration",
    badge: 2,
    roles: ["admin"],
  },
];

// ─── NavButton ────────────────────────────────────────────────────────────────

function NavButton({
  item,
  isActive,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label={item.label}
        className={`
          relative w-11 h-11 rounded-2xl flex items-center justify-center
          transition-all duration-300 ease-out outline-none
          ${
            isActive
              ? "bg-gradient-to-br from-[#a3e635] to-[#65a30d] text-black shadow-lg shadow-lime-300/50 scale-105"
              : "bg-white/70 text-gray-400 hover:bg-white hover:text-gray-700 hover:shadow-md hover:shadow-gray-200/60 hover:scale-105"
          }
        `}
      >
        {item.icon}

        {item.badge !== undefined && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-0.5 rounded-full bg-rose-400 text-white text-[9px] font-bold flex items-center justify-center">
            {item.badge > 9 ? "9+" : item.badge}
          </span>
        )}

        {isActive && (
          <span className="absolute -left-3.5 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-[#65a30d]" />
        )}
      </button>

      {/* Tooltip */}
      <div
        aria-hidden="true"
        className={`
          pointer-events-none absolute left-14 top-1/2 -translate-y-1/2 z-[60]
          px-3 py-1.5 rounded-xl bg-gray-900/95 text-white text-xs font-semibold
          whitespace-nowrap shadow-2xl border border-white/5
          transition-all duration-200 ease-out
          ${hovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"}
        `}
      >
        {item.label}
        <span className="absolute right-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-gray-900/95" />
      </div>
    </div>
  );
}

// ─── Role Badge ───────────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: UserRole }) {
  const isAdmin = role === "admin";
  return (
    <div
      title={isAdmin ? "Admin" : "Peternak"}
      className={`
        w-11 h-5 rounded-full flex items-center justify-center
        text-[9px] font-bold tracking-wider uppercase
        ${isAdmin ? "bg-violet-100 text-violet-600" : "bg-lime-100 text-lime-700"}
      `}
    >
      {isAdmin ? "Admin" : "Peternak"}
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export default function Sidebar({ onNavChange }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { role } = useCurrentUser();
  const logout = useLogout();

  const currentRole: UserRole = role ?? "peternak";

  const navItems = useMemo(
    () => ALL_NAV_ITEMS.filter((item) => item.roles.includes(currentRole)),
    [currentRole]
  );

  // ← active sekarang dihitung dari pathname secara reaktif
  // tidak pakai useState supaya selalu sinkron dengan URL
  const active = useMemo(() => {
    // exact match dulu
    const exact = navItems.find((i) => i.href === pathname);
    if (exact) return exact.id;

    // partial match — cari path paling spesifik yang cocok
    const partial = navItems
      .filter((i) => i.href && i.href !== "/dashboard" && pathname.startsWith(i.href))
      .sort((a, b) => (b.href?.length ?? 0) - (a.href?.length ?? 0))[0];
    if (partial) return partial.id;

    // fallback ke dashboard
    return "dashboard";
  }, [pathname, navItems]);

  const handleNav = (item: NavItem) => {
    onNavChange?.(item.id);
    if (item.href) router.push(item.href);
  };

  return (
    <aside
      className="
        fixed left-4 top-1/2 -translate-y-1/2 z-50
        flex flex-col items-center
        w-[68px] rounded-[28px]
        bg-white/75 backdrop-blur-3xl
        border border-white/90
        shadow-[0_8px_48px_rgba(0,0,0,0.10),0_2px_8px_rgba(0,0,0,0.05)]
        py-5 px-3 gap-2 select-none
      "
    >
      {/* Logo */}
      <div className="relative mb-1">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#a3e635] to-[#4d7c0f] flex items-center justify-center shadow-lg shadow-lime-300/40">
          <Leaf size={19} className="text-white" strokeWidth={2.5} />
        </div>
        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-white flex items-center justify-center">
          <span className="w-2 h-2 rounded-full bg-[#a3e635] animate-pulse" />
        </span>
      </div>

      <RoleBadge role={currentRole} />

      <div className="w-6 h-px bg-gray-100 my-1" />

      <nav className="flex flex-col gap-2.5" aria-label="Main navigation">
        {navItems.map((item) => (
          <NavButton
            key={item.id}
            item={item}
            isActive={active === item.id}
            onClick={() => handleNav(item)}
          />
        ))}
      </nav>

      <div className="flex-1" />
      <div className="w-6 h-px bg-gray-100 mb-1" />

      <button
        aria-label="Log out"
        onClick={() => logout.mutate()}
        className="
          mt-2 w-11 h-11 rounded-2xl bg-white/70 text-gray-300
          hover:bg-rose-50 hover:text-rose-400 border border-transparent
          hover:border-rose-100 flex items-center justify-center
          transition-all duration-200 hover:scale-105
        "
      >
        <LogOut size={15} strokeWidth={2} />
      </button>
    </aside>
  );
}