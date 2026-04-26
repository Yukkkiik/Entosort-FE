"use client";

import { Download, Filter } from "lucide-react";

type ReportFilterProps = {
  startDate: string;
  endDate: string;
  classification: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onClassificationChange: (value: string) => void;
};

const classifications = ["All", "Larva", "Prepupa", "Reject"];

export default function ReportFilter({
  startDate,
  endDate,
  classification,
  onStartDateChange,
  onEndDateChange,
  onClassificationChange,
}: ReportFilterProps) {
  return (
    <section className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-xl shadow-lime-950/5 backdrop-blur-xl md:p-6">
      <div className="mb-5 flex items-center gap-2">
        <Filter className="h-5 w-5 text-lime-600" />
        <h2 className="text-lg font-bold text-gray-950">Report Filter</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-gray-600">
            Start Date
          </span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-lime-400 focus:ring-4 focus:ring-lime-100"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-gray-600">End Date</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-lime-400 focus:ring-4 focus:ring-lime-100"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-gray-600">
            Classification
          </span>
          <select
            value={classification}
            onChange={(e) => onClassificationChange(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-lime-400 focus:ring-4 focus:ring-lime-100"
          >
            {classifications.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>

        <div className="flex items-end">
          <button
            type="button"
            className="group flex w-full items-center justify-center gap-2 rounded-2xl border border-lime-400 bg-white px-4 py-3 text-sm font-bold text-lime-700 transition-all duration-300 hover:-translate-y-1 hover:bg-lime-400 hover:text-gray-950 hover:shadow-lg hover:shadow-lime-500/20"
          >
            <Download className="h-4 w-4 transition group-hover:scale-110" />
            Export PDF
          </button>
        </div>
      </div>
    </section>
  );
}