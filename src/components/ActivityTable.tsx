"use client";

import { ArrowUpDown, Database } from "lucide-react";
import { useMemo, useState } from "react";

export type ReportStatus = "Completed" | "Warning" | "Failed";

export type LarvaReport = {
  id: string;
  timestamp: string;
  sessionId: string;
  larvaCount: number;
  prepupaCount: number;
  rejectCount: number;
  accuracy: number;
  status: ReportStatus;
};

type ActivityTableProps = {
  data: LarvaReport[];
};

type SortKey =
  | "timestamp"
  | "sessionId"
  | "larvaCount"
  | "prepupaCount"
  | "rejectCount"
  | "total"
  | "accuracy"
  | "status";

type SortDirection = "asc" | "desc";

export default function ActivityTable({ data }: ActivityTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("timestamp");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const getValue = (item: LarvaReport) => {
        if (sortKey === "total") {
          return item.larvaCount + item.prepupaCount + item.rejectCount;
        }

        return item[sortKey];
      };

      const aValue = getValue(a);
      const bValue = getValue(b);

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }

      return sortDirection === "asc"
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });
  }, [data, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDirection("desc");
  };

  if (sortedData.length === 0) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
          <Database className="h-7 w-7 text-gray-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">No report data found</h3>
        <p className="mt-1 max-w-md text-sm text-gray-500">
          Try changing the date range or classification filter to display larva
          sorting records.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-gray-100">
      <div className="overflow-x-auto">
        <table className="min-w-[920px] w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <TableHead label="Timestamp" sortKey="timestamp" onSort={handleSort} />
              <TableHead label="Session ID" sortKey="sessionId" onSort={handleSort} />
              <TableHead label="Larva Count" sortKey="larvaCount" onSort={handleSort} />
              <TableHead label="Prepupa Count" sortKey="prepupaCount" onSort={handleSort} />
              <TableHead label="Reject Count" sortKey="rejectCount" onSort={handleSort} />
              <TableHead label="Total" sortKey="total" onSort={handleSort} />
              <TableHead label="Accuracy" sortKey="accuracy" onSort={handleSort} />
              <TableHead label="Status" sortKey="status" onSort={handleSort} />
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 bg-white">
            {sortedData.map((item) => {
              const total =
                item.larvaCount + item.prepupaCount + item.rejectCount;

              return (
                <tr
                  key={item.id}
                  className="transition hover:bg-lime-50/60"
                >
                  <td className="px-5 py-4 font-medium text-gray-700">
                    {item.timestamp}
                  </td>
                  <td className="px-5 py-4 font-bold text-gray-950">
                    {item.sessionId}
                  </td>
                  <td className="px-5 py-4 text-gray-600">{item.larvaCount}</td>
                  <td className="px-5 py-4 text-gray-600">
                    {item.prepupaCount}
                  </td>
                  <td className="px-5 py-4 text-gray-600">{item.rejectCount}</td>
                  <td className="px-5 py-4 font-bold text-gray-950">{total}</td>
                  <td className="px-5 py-4 text-gray-600">
                    {item.accuracy}%
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={item.status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TableHead({
  label,
  sortKey,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  onSort: (key: SortKey) => void;
}) {
  return (
    <th className="px-5 py-4">
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className="inline-flex items-center gap-2 font-bold transition hover:text-lime-700"
      >
        {label}
        <ArrowUpDown className="h-3.5 w-3.5" />
      </button>
    </th>
  );
}

function StatusBadge({ status }: { status: ReportStatus }) {
  const styles = {
    Completed: "bg-lime-100 text-lime-700 ring-lime-200",
    Warning: "bg-yellow-100 text-yellow-700 ring-yellow-200",
    Failed: "bg-red-100 text-red-700 ring-red-200",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ${styles[status]}`}
    >
      {status}
    </span>
  );
}