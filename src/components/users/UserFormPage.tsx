// components/users/UserFormPage.tsx
"use client";

import { useState } from "react";
import {
  ArrowLeft, User, Lock, Phone, Check, Loader2,
  AlertCircle, UserPlus, Pencil, Cpu, Plus, X,
  ChevronDown, Wifi, WifiOff,
} from "lucide-react";
import { useNodes } from "@/hooks/useNode";
import type { AppUser } from "@/types/user";
import type { NodeType} from "@/types/node";

// ─── Types ────────────────────────────────────────────────────────────────────

const defaultForm = { username: "", password: "", phone: "" };

const ROLES    = ["Peternak"] as const;
type Role      = typeof ROLES[number];
type NodeMode  = "existing" | "new";

interface NewNodeEntry {
  tempId:   string; // hanya untuk key React
  nodeId:   string;
  nodeType: NodeType;
}

interface Props {
  editUser:   AppUser | null;
  onBack:     () => void;
  onSubmit:   (
    form:        typeof defaultForm,
    existingNodeIds: string[],   // node sudah ada di DB → assign
    newNodes:    NewNodeEntry[],  // node baru → create dulu lalu assign
  ) => Promise<void>;
  isMutating: boolean;
}

// ─── NodeTypeSelect ───────────────────────────────────────────────────────────

function NodeTypeSelect({
  value,
  onChange,
}: {
  value: NodeType;
  onChange: (v: NodeType) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as NodeType)}
        className="w-full pl-3 pr-8 py-2 rounded-lg border border-slate-200 text-xs outline-none focus:border-green-500 focus:ring-2 focus:ring-green-50 transition-all appearance-none bg-white"
      >
        <option value="microcontroller">Microcontroller (ESP32)</option>
        <option value="raspberry">Raspberry Pi</option>
      </select>
      <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function UserFormPage({ editUser, onBack, onSubmit, isMutating }: Props) {
  const isEdit = !!editUser;

  // ── Form state ─────────────────────────────────────────────────────────────
  const [form,   setForm]   = useState(
    isEdit
      ? { username: editUser.username, password: "", phone: editUser.phone ?? "" }
      : defaultForm
  );
  const [role,   setRole]   = useState<Role>("Peternak");
  const [error,  setError]  = useState("");

  // ── Node state ─────────────────────────────────────────────────────────────
  const [nodeMode,       setNodeMode]       = useState<NodeMode>("existing");
  const [selectedNodes,  setSelectedNodes]  = useState<string[]>(
    // pre-fill kalau edit: node yang sudah assigned ke user ini
    isEdit ? (editUser.nodes ?? []).map((n) => n.nodeId) : []
  );
  const [newNodes,       setNewNodes]       = useState<NewNodeEntry[]>([]);
  const [newNodeId,      setNewNodeId]      = useState("");
  const [newNodeType,    setNewNodeType]    = useState<NodeType>("microcontroller");

  // ── Fetch existing nodes (unassigned saja, kecuali sudah milik user ini) ──
  const { nodes: allNodes, isLoading: nodesLoading } = useNodes(0); // 0 = no polling
  const availableNodes = allNodes.filter(
    (n) =>
      n.userId === null ||
      (isEdit && n.userId === editUser.id)
  );

  const set = (key: keyof typeof defaultForm) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((p) => ({ ...p, [key]: e.target.value }));

  // ── Toggle pilih existing node ─────────────────────────────────────────────
  const toggleNode = (nodeId: string) => {
    setSelectedNodes((prev) =>
      prev.includes(nodeId)
        ? prev.filter((id) => id !== nodeId)
        : [...prev, nodeId]
    );
  };

  // ── Tambah new node ke list ────────────────────────────────────────────────
  const addNewNode = () => {
    const id = newNodeId.trim().toUpperCase();
    if (!id) return;

    // Cek duplikat
    const dupInNew      = newNodes.some((n) => n.nodeId === id);
    const dupInExisting = allNodes.some((n) => n.nodeId === id);
    if (dupInNew || dupInExisting) {
      setError(`Node ID "${id}" sudah ada.`);
      return;
    }

    setNewNodes((prev) => [
      ...prev,
      { tempId: `${id}-${Date.now()}`, nodeId: id, nodeType: newNodeType },
    ]);
    setNewNodeId("");
    setError("");
  };

  const removeNewNode = (tempId: string) =>
    setNewNodes((prev) => prev.filter((n) => n.tempId !== tempId));

  const updateNewNodeType = (tempId: string, nodeType: NodeType) =>
    setNewNodes((prev) =>
      prev.map((n) => (n.tempId === tempId ? { ...n, nodeType } : n))
    );

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.username.trim()) return setError("Username wajib diisi.");
    if (!form.phone.trim())    return setError("Nomor HP wajib diisi.");
    if (!isEdit && !form.password.trim()) return setError("Password wajib diisi.");
    setError("");

    try {
      await onSubmit(form, selectedNodes, newNodes);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const totalNodes = selectedNodes.length + newNodes.length;

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">

      {/* ── Top bar ── */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 transition-colors shadow-sm"
        >
          <ArrowLeft size={14} />
          Kembali
        </button>
        <div>
          <h1 className="text-base font-bold text-slate-900">
            {isEdit ? "Edit Peternak" : "Tambah Peternak Baru"}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {isEdit ? "Perbarui data akun peternak" : "Isi detail dan assign node sekaligus"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-5 items-start">

        {/* ══ Kolom kiri: Data Peternak (3/5) ══ */}
        <div className="col-span-3 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">

          {/* Header */}
          <div className="bg-lime-50 border-b border-lime-100 px-6 py-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-green-700 flex items-center justify-center flex-shrink-0">
              {isEdit ? <Pencil size={16} className="text-white" /> : <UserPlus size={16} className="text-white" />}
            </div>
            <div>
              <p className="text-sm font-semibold text-green-900">
                {isEdit ? "Edit Peternak" : "Data Peternak"}
              </p>
              <p className="text-xs text-lime-700 mt-0.5">
                {isEdit ? "Kosongkan password jika tidak diubah" : "Isi informasi akun peternak baru"}
              </p>
            </div>
          </div>

          {/* Fields */}
          <div className="px-6 py-5 space-y-4">

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2.5 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600">
                <AlertCircle size={13} className="flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Username */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Username</label>
              <div className="relative">
                <User size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={form.username}
                  onChange={set("username")}
                  placeholder="contoh: budi_peternak"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-50 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">
                Password{" "}
                {isEdit && <span className="text-xs text-slate-400 font-normal">— opsional</span>}
              </label>
              <div className="relative">
                <Lock size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="password"
                  value={form.password}
                  onChange={set("password")}
                  placeholder={isEdit ? "Kosongkan jika tidak diubah" : "Minimal 8 karakter"}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-50 transition-all"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">No. HP</label>
              <div className="relative">
                <Phone size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={set("phone")}
                  placeholder="contoh: 08123456789"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-50 transition-all"
                />
              </div>
            </div>

            {/* Role pills */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Role</label>
              <div className="flex flex-wrap gap-2">
                {ROLES.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                      role === r
                        ? "bg-green-700 text-white border-green-700"
                        : "bg-white text-slate-500 border-slate-200 hover:border-green-400 hover:text-green-700"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>   
          </div>
        </div>

        {/* ══ Kolom kanan: Assign Nodes (2/5) ══ */}
        <div className="col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">

          {/* Header */}
          <div className="bg-slate-50 border-b border-slate-100 px-5 py-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-700 flex items-center justify-center flex-shrink-0">
              <Cpu size={15} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800">Nodes</p>
              <p className="text-xs text-slate-400 mt-0.5">Assign node ke peternak ini</p>
            </div>
            {totalNodes > 0 && (
              <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-100 px-2 py-1 rounded-lg">
                {totalNodes} dipilih
              </span>
            )}
          </div>

          {/* Mode toggle */}
          <div className="px-5 pt-4">
            <div className="flex gap-1.5 p-1 bg-slate-100 rounded-xl">
              {(["existing", "new"] as NodeMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setNodeMode(m)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    nodeMode === m
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {m === "existing" ? "Pilih yang ada" : "Input baru"}
                </button>
              ))}
            </div>
          </div>

          <div className="px-5 py-4 space-y-3">

            {/* ── Mode: pilih existing ── */}
            {nodeMode === "existing" && (
              <>
                {nodesLoading ? (
                  <div className="flex items-center justify-center py-8 gap-2 text-slate-400">
                    <Loader2 size={16} className="animate-spin" />
                    <span className="text-xs">Memuat node...</span>
                  </div>
                ) : availableNodes.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-2">
                      <Cpu size={16} className="text-slate-300" />
                    </div>
                    <p className="text-xs text-slate-500 font-medium">Tidak ada node tersedia</p>
                    <p className="text-xs text-slate-400 mt-1">Semua node sudah dimiliki peternak lain</p>
                    <button
                      type="button"
                      onClick={() => setNodeMode("new")}
                      className="mt-3 text-xs text-green-700 font-medium hover:underline"
                    >
                      Input Node ID baru →
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {availableNodes.map((node) => {
                      const checked = selectedNodes.includes(node.nodeId);
                      return (
                        <button
                          key={node.id}
                          type="button"
                          onClick={() => toggleNode(node.nodeId)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all ${
                            checked
                              ? "bg-green-50 border-green-300"
                              : "bg-white border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          {/* Checkbox visual */}
                          <div className={`w-4 h-4 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                            checked
                              ? "bg-green-600 border-green-600"
                              : "border-slate-300"
                          }`}>
                            {checked && <Check size={10} className="text-white" strokeWidth={3} />}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-800 font-mono truncate">
                              {node.nodeId}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5 capitalize">
                              {node.nodeType}
                            </p>
                          </div>

                          {/* Status dot */}
                          <span className={`flex items-center gap-1 text-[10px] font-medium flex-shrink-0 ${
                            node.status === "online" ? "text-emerald-600" : "text-slate-400"
                          }`}>
                            {node.status === "online"
                              ? <Wifi size={10} />
                              : <WifiOff size={10} />
                            }
                            {node.status}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {/* ── Mode: input baru ── */}
            {nodeMode === "new" && (
              <div className="space-y-3">
                {/* Input area */}
                <div className="space-y-2">
                  <div className="relative">
                    <Cpu size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      value={newNodeId}
                      onChange={(e) => setNewNodeId(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === "Enter" && addNewNode()}
                      placeholder="contoh: ESP32-01"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono outline-none focus:border-green-500 focus:ring-2 focus:ring-green-50 transition-all"
                    />
                  </div>
                  <NodeTypeSelect value={newNodeType} onChange={setNewNodeType} />
                  <button
                    type="button"
                    onClick={addNewNode}
                    disabled={!newNodeId.trim()}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-800 text-white text-xs font-medium hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus size={13} />
                    Tambah ke list
                  </button>
                </div>

                {/* New nodes list */}
                {newNodes.length > 0 && (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {newNodes.map((n) => (
                      <div
                        key={n.tempId}
                        className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                      >
                        <Cpu size={12} className="text-slate-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold font-mono text-slate-800 truncate">{n.nodeId}</p>
                          <div className="mt-1">
                            <NodeTypeSelect
                              value={n.nodeType}
                              onChange={(v) => updateNewNodeType(n.tempId, v)}
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeNewNode(n.tempId)}
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors flex-shrink-0"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {newNodes.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-3">
                    Belum ada node ditambahkan
                  </p>
                )}
              </div>
            )}

            {/* ── Summary semua node yang akan di-assign ── */}
            {totalNodes > 0 && (
              <div className="pt-2 border-t border-slate-100">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Akan di-assign ({totalNodes})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedNodes.map((id) => (
                    <span key={id} className="inline-flex items-center gap-1 text-[10px] font-mono font-medium bg-green-50 text-green-700 border border-green-100 px-2 py-1 rounded-lg">
                      <Wifi size={9} />
                      {id}
                    </span>
                  ))}
                  {newNodes.map((n) => (
                    <span key={n.tempId} className="inline-flex items-center gap-1 text-[10px] font-mono font-medium bg-blue-50 text-blue-700 border border-blue-100 px-2 py-1 rounded-lg">
                      <Plus size={9} />
                      {n.nodeId}
                    </span>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 mt-2">
                  <span className="text-green-600">●</span> existing &nbsp;
                  <span className="text-blue-500">●</span> baru
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-6 py-4 flex items-center justify-between">
        <p className="text-xs text-slate-400">
          {totalNodes > 0
            ? `${totalNodes} node akan di-assign ke peternak ini`
            : "Node bisa di-assign nanti dari halaman edit"}
        </p>
        <div className="flex gap-2.5">
          <button
            onClick={onBack}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-500 hover:bg-slate-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={isMutating}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-700 text-white text-sm font-medium hover:bg-green-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {isMutating ? (
              <><Loader2 size={14} className="animate-spin" /> Menyimpan...</>
            ) : (
              <><Check size={14} strokeWidth={2.5} /> {isEdit ? "Simpan Perubahan" : "Tambah Peternak"}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}