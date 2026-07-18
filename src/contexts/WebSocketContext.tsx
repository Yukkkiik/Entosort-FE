"use client";

import {
  createContext, useContext, useEffect, useRef, useState, useCallback,
  type ReactNode,
} from "react";

interface WsMessage<T = unknown> {
  type:       string;
  data?:   T;       
  timestamp?: string;
}

type Listener = (msg: WsMessage) => void;

interface WebSocketContextValue {
  isConnected: boolean;
  subscribe: (type: string, listener: Listener) => () => void;
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

interface Props {
  children: ReactNode;
  wsUrl?: string;
}

export function WebSocketProvider({
  children,
  wsUrl = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:3001",
}: Props) {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const listenersRef = useRef<Map<string, Set<Listener>>>(new Map());
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;

    const connect = () => {
      if (cancelled) return;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        console.log("[WS Global] Connected");
      };

      ws.onclose = () => {
        setIsConnected(false);
        if (!cancelled) {
          reconnectTimer.current = setTimeout(connect, 3000);
        }
      };

      ws.onerror = (e) => {
        console.error("[WS Global] Error:", e);
      };

      ws.onmessage = (e) => {
        try {
          const msg: WsMessage = JSON.parse(e.data as string);

          const listeners = listenersRef.current.get(msg.type);
          listeners?.forEach((fn) => fn(msg));

          const wildcard = listenersRef.current.get("*");
          wildcard?.forEach((fn) => fn(msg));
        } catch (err) {
          console.warn("[WS Global] Parse error:", err);
        }
      };
    };

    connect();

    return () => {
      cancelled = true;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [wsUrl]);

  const subscribe = useCallback((type: string, listener: Listener) => {
    if (!listenersRef.current.has(type)) {
      listenersRef.current.set(type, new Set());
    }
    listenersRef.current.get(type)!.add(listener);

    return () => {
      const set = listenersRef.current.get(type);
      set?.delete(listener);
      if (set && set.size === 0) listenersRef.current.delete(type);
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ isConnected, subscribe }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const ctx = useContext(WebSocketContext);
  if (!ctx) {
    throw new Error("useWebSocket harus dipakai di dalam <WebSocketProvider>");
  }
  return ctx;
}