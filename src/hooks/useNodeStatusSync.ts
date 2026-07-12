"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useWebSocket } from "@/contexts/WebSocketContext";
import { UNIT_KEYS } from "@/hooks/useUnit";
import { NODE_KEYS } from "@/hooks/useNode";
import type { AppUnit } from "@/types/unit";
import type { AppNode, NodeType, NodeStatus } from "@/types/node";

interface NodeStatusPayload {
  nodeId:    string;
  unitId:    string;
  nodeType:  NodeType;
  status:    NodeStatus;
  lastSeen:  string;
  isNewNode?: boolean;
}

export function useNodeStatusSync() {
  const { subscribe } = useWebSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = subscribe("node_status", (msg) => {
      const payload = msg.data as NodeStatusPayload;
      if (!payload?.unitId || !payload?.nodeType) return;

      // ── 1. Update cache "units" list (dipakai UnitTable) ──
      queryClient.setQueryData<AppUnit[]>(UNIT_KEYS.all, (old) => {
        if (!old) return old;

        return old.map((unit) => {
          if (unit.unitId !== payload.unitId) return unit;

          const existingNodes = unit.nodes ?? [];
          const nodeExists = existingNodes.some((n) => n.nodeType === payload.nodeType);

          const updatedNodes = nodeExists
            ? existingNodes.map((n) =>
                n.nodeType === payload.nodeType
                  ? { ...n, status: payload.status, lastSeen: payload.lastSeen }
                  : n
              )
            : [
                ...existingNodes,
                {
                  nodeId:    payload.nodeId,
                  nodeType:  payload.nodeType,
                  status:    payload.status,
                  lastSeen:  payload.lastSeen,
                } as AppUnit["nodes"][number],
              ];

          const unitStatus: NodeStatus = updatedNodes.some((n) => n.status === "online")
            ? "online"
            : "offline";

          return { ...unit, nodes: updatedNodes, status: unitStatus };
        });
      });

      // ── 2. Update cache nodes-by-unit (dipakai useNodesByUnit) ──
      queryClient.setQueryData<AppNode[]>(NODE_KEYS.byUnit(payload.unitId), (old) => {
        if (!old) return old;

        const exists = old.some((n) => n.nodeType === payload.nodeType);

        if (!exists) {
          const newNode: AppNode = {
            id:        0, // placeholder, akan dikoreksi saat refetch berikutnya
            nodeId:    payload.nodeId,
            unitId:    payload.unitId,
            nodeType:  payload.nodeType,
            status:    payload.status,
            ipAddress: null,
            firmware:  null,
            lastSeen:  payload.lastSeen,
            createdAt: payload.lastSeen,
            updatedAt: payload.lastSeen,
          };
          return [...old, newNode];
        }

        return old.map((n) =>
          n.nodeType === payload.nodeType
            ? { ...n, status: payload.status, lastSeen: payload.lastSeen }
            : n
        );
      });

      // ── 3. Update cache spesifik esp32 / rpi (dipakai useEsp32 / useRpi) ──
      const specificKey = payload.nodeType === "esp32"
        ? NODE_KEYS.esp32(payload.unitId)
        : NODE_KEYS.rpi(payload.unitId);

      queryClient.setQueryData<AppNode>(specificKey, (old) => {
        if (!old) return old;
        return { ...old, status: payload.status, lastSeen: payload.lastSeen };
      });
    });

    return unsubscribe;
  }, [subscribe, queryClient]);
}