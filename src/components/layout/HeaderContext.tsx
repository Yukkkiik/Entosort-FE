"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { PageHeaderProps } from "@/types/node";

type HeaderConfig = Omit<PageHeaderProps, "animationDelay">;

interface HeaderContextValue {
  config: HeaderConfig;
  setHeader: (cfg: HeaderConfig) => void;
}

const HeaderContext = createContext<HeaderContextValue | null>(null);

// ─── Provider — taruh di DashboardLayout ─────────────────────────────────────

export function HeaderProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<HeaderConfig>({ title: "" });

  const setHeader = useCallback((cfg: HeaderConfig) => {
    setConfig(cfg);
  }, []);

  return (
    <HeaderContext.Provider value={{ config, setHeader }}>
      {children}
    </HeaderContext.Provider>
  );
}

// ─── useHeaderConfig — dibaca oleh DashboardLayout untuk render PageHeader ────

export function useHeaderConfig() {
  const ctx = useContext(HeaderContext);
  if (!ctx) throw new Error("useHeaderConfig must be used inside HeaderProvider");
  return ctx;
}

// ─── useSetHeader — dipanggil sekali di setiap page ──────────────────────────
// Contoh pemakaian:
//   useSetHeader({ title: "Dashboard", titleIcon: "📊", nodeId: "1" });

export function useSetHeader(cfg: HeaderConfig) {
  const { setHeader } = useHeaderConfig();

  // Simpan cfg ke ref supaya useEffect tidak perlu cfg sebagai dependency
  // (menghindari infinite loop kalau object literal dikirim langsung)
  const cfgRef = useRef(cfg);
  cfgRef.current = cfg;

  useEffect(() => {
    setHeader(cfgRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}