"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ScanSearch,
  BarChart3,
  Sliders,
  Settings,
  Bell,
  LogOut,
  Leaf,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  href?: string;
  badge?: number;
}

interface SidebarProps {
  activeItem?: string;
  onNavChange?: (id: string) => void;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const NAV_ITEMS: NavItem[] = [
  {
    id: "dashboard",
    icon: <LayoutDashboard size={18} strokeWidth={2} />,
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    id: "control",
    icon: <Sliders size={18} strokeWidth={2} />,
    label: "Manual Control",
    href: "/dashboard/control",
  },
  {
    id: "reports",
    icon: <BarChart3 size={18} strokeWidth={2} />,
    label: "Reports",
    href:"/dashboard/reports"
  },
];

const BOTTOM_ITEMS: NavItem[] = [
  {
    id: "settings",
    icon: <Settings size={18} strokeWidth={2} />,
    label: "Settings",
  },
  {
    id: "notifications",
    icon: <Bell size={18} strokeWidth={2} />,
    label: "Notifications",
    badge: 2,
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

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export default function Sidebar({ activeItem, onNavChange }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const resolveActive = (): string => {
    if (activeItem) return activeItem;
    const all = [...NAV_ITEMS, ...BOTTOM_ITEMS];
    const exact = all.find((i) => i.href === pathname);
    if (exact) return exact.id;
    const partial = all.find(
      (i) => i.href && pathname.startsWith(i.href) && i.href !== "/"
    );
    return partial?.id ?? "dashboard";
  };

  const [active, setActive] = useState<string>(resolveActive);

  const handleNav = (item: NavItem) => {
    setActive(item.id);
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
      <div className="relative mb-3">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#a3e635] to-[#4d7c0f] flex items-center justify-center shadow-lg shadow-lime-300/40">
          <Leaf size={19} className="text-white" strokeWidth={2.5} />
        </div>
        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-white flex items-center justify-center">
          <span className="w-2 h-2 rounded-full bg-[#a3e635] animate-pulse" />
        </span>
      </div>

      <div className="w-6 h-px bg-gray-100 mb-1" />

      <nav className="flex flex-col gap-2.5" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => (
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

      <nav className="flex flex-col gap-2.5" aria-label="Secondary navigation">
        {BOTTOM_ITEMS.map((item) => (
          <NavButton
            key={item.id}
            item={item}
            isActive={active === item.id}
            onClick={() => handleNav(item)}
          />
        ))}
      </nav>

      <button
        aria-label="Log out"
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