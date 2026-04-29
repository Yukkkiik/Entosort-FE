"use client";

import { useState } from "react";
import {
  Search,
  UserPlus,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  CircleDot,
  CircleMinus,
  X,
  Check,
  Shield,
  Eye,
  Wrench,
} from "lucide-react";
import { User, UserRole, UserStatus, avatarColors, mockUsers } from "@/@types/mockupUsers";
import { cn } from "@/lib/utils";

const roleIcon: Record<UserRole, React.ComponentType<{ size?: number }>> = {
  Admin: Shield,
  Operator: Wrench,
  Viewer: Eye,
};

const roleBadge: Record<UserRole, string> = {
  Admin: "badge-admin",
  Operator: "badge-operator",
  Viewer: "badge-viewer",
};

type SortField = "name" | "role" | "status" | "lastLogin";
type SortDir = "asc" | "desc" | null;

interface UserTableProps {
  initialUsers?: User[];
}

export default function UserTable({ initialUsers = mockUsers }: UserTableProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);

  // Form state
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "Viewer" as UserRole,
    status: "Active" as UserStatus,
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDir === "asc") setSortDir("desc");
      else if (sortDir === "desc") { setSortField(null); setSortDir(null); }
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const filtered = users
    .filter(
      (u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.role.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (!sortField || !sortDir) return 0;
      const av = a[sortField].toLowerCase();
      const bv = b[sortField].toLowerCase();
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronsUpDown size={13} className="text-slate-300" />;
    return sortDir === "asc" ? (
      <ChevronUp size={13} className="text-green-600" />
    ) : (
      <ChevronDown size={13} className="text-green-600" />
    );
  };

  const openAdd = () => {
    setForm({ name: "", email: "", role: "Viewer", status: "Active" });
    setEditUser(null);
    setShowAddModal(true);
  };

  const openEdit = (user: User) => {
    setForm({ name: user.name, email: user.email, role: user.role, status: user.status });
    setEditUser(user);
    setShowAddModal(true);
  };

  const handleSubmit = () => {
    if (!form.name.trim() || !form.email.trim()) return;
    if (editUser) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editUser.id
            ? { ...u, name: form.name, email: form.email, role: form.role, status: form.status }
            : u
        )
      );
    } else {
      const initials = form.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
      setUsers((prev) => [
        ...prev,
        {
          id: `u${Date.now()}`,
          name: form.name,
          email: form.email,
          role: form.role,
          status: form.status,
          lastLogin: "Never",
          avatar: initials,
        },
      ]);
    }
    setShowAddModal(false);
  };

  const handleDelete = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    setDeleteConfirm(null);
  };

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search users by name, email, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-base pl-10 pr-4"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <button onClick={openAdd} className="btn-primary flex-shrink-0">
          <UserPlus size={15} strokeWidth={2.5} />
          Add New User
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100">
              {(
                [
                  { label: "User", field: "name" as SortField },
                  { label: "Role", field: "role" as SortField },
                  { label: "Status", field: "status" as SortField },
                  { label: "Last Login", field: "lastLogin" as SortField },
                  { label: "Actions", field: null },
                ] as { label: string; field: SortField | null }[]
              ).map(({ label, field }) => (
                <th
                  key={label}
                  className={cn(
                    "text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider",
                    field && "cursor-pointer select-none hover:text-slate-700 transition-colors"
                  )}
                  onClick={() => field && handleSort(field)}
                >
                  <div className="flex items-center gap-1.5">
                    {label}
                    {field && <SortIcon field={field} />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-16 text-slate-400">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                      <Search size={20} className="text-slate-300" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-500">No users found</p>
                      <p className="text-xs mt-1">Try adjusting your search</p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((user) => {
                const RoleIcon = roleIcon[user.role];
                const avatarGradient = avatarColors[user.avatar] ?? "from-slate-400 to-slate-600";
                return (
                  <tr
                    key={user.id}
                    className="table-row-hover group bg-white"
                  >
                    {/* User */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-8 h-8 rounded-xl bg-gradient-to-br flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-soft-sm",
                            avatarGradient
                          )}
                        >
                          {user.avatar}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-800 truncate">{user.name}</p>
                          <p className="text-xs text-slate-400 truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-4 py-3.5">
                      <span className={roleBadge[user.role]}>
                        <RoleIcon size={11} />
                        {user.role}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      {user.status === "Active" ? (
                        <span className="badge-active">
                          <CircleDot size={10} />
                          Active
                        </span>
                      ) : (
                        <span className="badge-inactive">
                          <CircleMinus size={10} />
                          Inactive
                        </span>
                      )}
                    </td>

                    {/* Last Login */}
                    <td className="px-4 py-3.5">
                      <span className="text-slate-500 text-xs font-mono">
                        {user.lastLogin}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                        <button
                          onClick={() => openEdit(user)}
                          className="btn-edit"
                          title="Edit user"
                          aria-label={`Edit ${user.name}`}
                        >
                          <Pencil size={14} />
                        </button>
                        {deleteConfirm === user.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors duration-150 active:scale-90"
                              title="Confirm delete"
                            >
                              <Check size={13} strokeWidth={2.5} />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors duration-150 active:scale-90"
                              title="Cancel"
                            >
                              <X size={13} strokeWidth={2.5} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(user.id)}
                            className="btn-danger"
                            title="Delete user"
                            aria-label={`Delete ${user.name}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Row count */}
      {filtered.length > 0 && (
        <p className="text-xs text-slate-400 mt-3 px-1">
          Showing{" "}
          <span className="font-semibold text-slate-600">{filtered.length}</span>{" "}
          of{" "}
          <span className="font-semibold text-slate-600">{users.length}</span>{" "}
          users
        </p>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setShowAddModal(false)}
        >
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
          <div className="relative bg-white rounded-3xl shadow-soft-lg w-full max-w-md p-6 animate-scale-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-display font-bold text-slate-900">
                  {editUser ? "Edit User" : "Add New User"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {editUser ? "Update user details below" : "Fill in user details below"}
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all duration-150"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                  Full Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Ahmad Fauzi"
                  className="input-base"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                  Email Address
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="user@biolab.id"
                  className="input-base"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                    Role
                  </label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm((p) => ({ ...p, role: e.target.value as UserRole }))}
                    className="input-base"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Operator">Operator</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, status: e.target.value as UserStatus }))
                    }
                    className="input-base"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6 pt-5 border-t border-slate-100">
              <button
                onClick={() => setShowAddModal(false)}
                className="btn-outline flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!form.name.trim() || !form.email.trim()}
                className="btn-primary flex-1"
              >
                <Check size={14} strokeWidth={2.5} />
                {editUser ? "Update User" : "Add User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}