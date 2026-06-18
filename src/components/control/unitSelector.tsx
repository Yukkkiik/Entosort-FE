"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Cpu, MapPin, Wifi, WifiOff, ChevronDown, Check } from "lucide-react";
import type { AppUnit, UnitNode } from "@/types/unit";

interface Props {
  units:           AppUnit[];
  selectedUnitId:  string;
  esp32Node?:      UnitNode | null;
  onChange:        (unitId: string) => void;
  animationDelay?: number;
}

export default function UnitSelector({
  units,
  selectedUnitId,
  esp32Node,
  onChange,
  animationDelay = 0,
}: Props) {
  const [open,        setOpen]       = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef   = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedUnit = units.find((u) => u.unitId === selectedUnitId);
  const isOnline     = esp32Node?.status === "online";

  // Hitung posisi dropdown berdasarkan posisi button di viewport
  const updatePosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setDropdownPos({
      top:   rect.bottom + window.scrollY + 8,
      left:  rect.left   + window.scrollX,
      width: rect.width,
    });
  }, []);

  const handleOpen = () => {
    updatePosition();
    setOpen((v) => !v);
  };

  // Tutup kalau klik di luar
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        buttonRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Update posisi kalau window di-scroll/resize
  useEffect(() => {
    if (!open) return;
    const update = () => updatePosition();
    window.addEventListener("scroll",  update, true);
    window.addEventListener("resize",  update);
    return () => {
      window.removeEventListener("scroll",  update, true);
      window.removeEventListener("resize",  update);
    };
  }, [open, updatePosition]);

  return (
    <div
      className="opacity-0 animate-[fadeSlideUp_0.5s_ease_forwards]"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-xl shadow-lime-950/5 backdrop-blur-xl">
        {/* Label */}
        <div className="flex items-center gap-2 mb-4">
          <Cpu size={15} strokeWidth={2} className="text-lime-600" />
          <span className="text-xs font-extrabold text-gray-500 uppercase tracking-widest">
            Target Unit (ESP32)
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {/* ── Dropdown trigger ── */}
          <div className="relative w-full sm:w-72">
            <button
              ref={buttonRef}
              type="button"
              onClick={handleOpen}
              className="
                w-full flex items-center justify-between gap-3
                rounded-2xl border border-gray-200 bg-white
                px-4 py-3 text-sm outline-none
                transition focus:border-lime-400 focus:ring-4 focus:ring-lime-100
                hover:border-gray-300
              "
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  selectedUnit?.status === "online" ? "bg-lime-400" : "bg-gray-300"
                }`} />
                <span className="font-semibold text-gray-800 truncate">
                  {selectedUnit?.unitId ?? "Pilih unit..."}
                </span>
                {selectedUnit?.location && (
                  <span className="text-xs text-gray-400 truncate hidden sm:block">
                    — {selectedUnit.location}
                  </span>
                )}
              </div>
              <ChevronDown
                size={15}
                strokeWidth={2.5}
                className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                  open ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Portal — render langsung di body, tidak terpengaruh parent overflow */}
            {open && typeof window !== "undefined" && createPortal(
              <div
                ref={dropdownRef}
                style={{
                  position: "absolute",
                  top:      dropdownPos.top,
                  left:     dropdownPos.left,
                  width:    dropdownPos.width,
                  zIndex:   9999,
                }}
                className="rounded-2xl border border-gray-100 bg-white shadow-xl shadow-gray-200/60"
              >
                <div className="max-h-60 overflow-y-auto rounded-2xl">
                  {units.map((unit) => {
                    const isSelected = unit.unitId === selectedUnitId;
                    const online     = unit.status === "online";
                    return (
                      <button
                        key={unit.unitId}
                        type="button"
                        onClick={() => { onChange(unit.unitId); setOpen(false); }}
                        className={`
                          w-full flex items-center gap-3 px-4 py-3
                          text-left text-sm transition-colors
                          ${isSelected ? "bg-lime-50 text-lime-800" : "hover:bg-gray-50 text-gray-700"}
                        `}
                      >
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          online ? "bg-lime-400" : "bg-gray-300"
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{unit.unitId}</p>
                          {unit.location && (
                            <p className="text-[11px] text-gray-400 truncate">{unit.location}</p>
                          )}
                        </div>
                        {isSelected && (
                          <Check size={14} strokeWidth={2.5} className="text-lime-600 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>,
              document.body
            )}
          </div>

          {/* ── ESP32 info chips ── */}
          {selectedUnit && (
            <div className="flex flex-wrap items-center gap-3">
              {esp32Node && (
                <div className="flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2">
                  <Cpu size={13} strokeWidth={2} className="text-slate-500" />
                  <span className="text-xs font-mono font-semibold text-slate-700">
                    {esp32Node.nodeId}
                  </span>
                </div>
              )}

              <div className={`
                flex items-center gap-1.5 rounded-xl px-3 py-2 border text-xs font-bold
                ${isOnline
                  ? "bg-lime-50 border-lime-200/60 text-lime-700"
                  : "bg-gray-50 border-gray-200/60 text-gray-500"
                }
              `}>
                {isOnline
                  ? <><Wifi size={13} strokeWidth={2} /><span>Online</span></>
                  : <><WifiOff size={13} strokeWidth={2} /><span>Offline</span></>
                }
              </div>

              {esp32Node?.firmware && (
                <div className="flex items-center gap-1.5 rounded-xl bg-gray-50 border border-gray-100 px-3 py-2">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">FW</span>
                  <span className="text-xs font-mono font-semibold text-gray-600">
                    {esp32Node.firmware}
                  </span>
                </div>
              )}

              {selectedUnit.location && (
                <div className="flex items-center gap-1.5 rounded-xl bg-gray-50 border border-gray-100 px-3 py-2">
                  <MapPin size={12} strokeWidth={2} className="text-gray-400" />
                  <span className="text-xs text-gray-500 truncate max-w-[160px]">
                    {selectedUnit.location}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Warning offline */}
        {selectedUnit && !isOnline && (
          <p className="mt-3 text-xs font-semibold text-amber-600 flex items-center gap-1.5">
            <WifiOff size={12} strokeWidth={2.5} />
            ESP32 unit ini sedang offline — perintah kontrol mungkin tidak terkirim.
          </p>
        )}
      </div>
    </div>
  );
}