"use client";

import { useMemo, useState } from "react";
import {
  Bug,
  FileWarning,
  Layers3,
  Sprout,
  Activity,
} from "lucide-react";
import ReportFilter from "@/components/ReportFilter";
import SummaryCard from "@/components/SummaryCard";
import ActivityTable, { LarvaReport } from "@/components/ActivityTable";

const sampleReports: LarvaReport[] = [
  {
    id: "1",
    timestamp: "2026-04-26",
    sessionId: "SES-240426-001",
    larvaCount: 428,
    prepupaCount: 96,
    rejectCount: 12,
    accuracy: 98.4,
    status: "Completed",
  },
  {
    id: "2",
    timestamp: "2026-04-25",
    sessionId: "SES-240425-002",
    larvaCount: 382,
    prepupaCount: 121,
    rejectCount: 28,
    accuracy: 94.7,
    status: "Warning",
  },
  {
    id: "3",
    timestamp: "2026-04-24",
    sessionId: "SES-240424-003",
    larvaCount: 0,
    prepupaCount: 0,
    rejectCount: 0,
    accuracy: 0,
    status: "Failed",
  },
  {
    id: "4",
    timestamp: "2026-04-23",
    sessionId: "SES-240423-004",
    larvaCount: 512,
    prepupaCount: 88,
    rejectCount: 9,
    accuracy: 99.1,
    status: "Completed",
  },
];

export default function ReportsDashboard() {
  const [classification, setClassification] = useState("All");
  const [startDate, setStartDate] = useState("2026-04-23");
  const [endDate, setEndDate] = useState("2026-04-26");

  const filteredReports = useMemo(() => {
    return sampleReports.filter((report) => {
      const dateValid =
        report.timestamp >= startDate && report.timestamp <= endDate;

      if (!dateValid) return false;

      if (classification === "Larva") return report.larvaCount > 0;
      if (classification === "Prepupa") return report.prepupaCount > 0;
      if (classification === "Reject") return report.rejectCount > 0;

      return true;
    });
  }, [classification, startDate, endDate]);

  const summary = useMemo(() => {
    return filteredReports.reduce(
      (acc, report) => {
        acc.totalLarva += report.larvaCount;
        acc.totalPrepupa += report.prepupaCount;
        acc.totalReject += report.rejectCount;
        acc.sessions += 1;
        return acc;
      },
      {
        totalLarva: 0,
        totalPrepupa: 0,
        totalReject: 0,
        sessions: 0,
      }
    );
  }, [filteredReports]);

  return (
    <div className="mt-6 space-y-6">
      <ReportFilter
        startDate={startDate}
        endDate={endDate}
        classification={classification}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onClassificationChange={setClassification}
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={Bug}
          label="Total Larva"
          value={summary.totalLarva.toLocaleString()}
          trend="+12.4%"
        />
        <SummaryCard
          icon={Sprout}
          label="Total Prepupa"
          value={summary.totalPrepupa.toLocaleString()}
          trend="+8.1%"
        />
        <SummaryCard
          icon={FileWarning}
          label="Total Reject"
          value={summary.totalReject.toLocaleString()}
          trend="-3.2%"
        />
        <SummaryCard
          icon={Layers3}
          label="Total Sorting Sessions"
          value={summary.sessions.toString()}
          trend="+5 sessions"
        />
      </section>

      <section className="rounded-3xl border border-white/70 bg-white/80 p-4 shadow-xl shadow-lime-950/5 backdrop-blur-xl md:p-6">
        <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-lime-600" />
              <h2 className="text-lg font-bold text-gray-950">
                Larva Activity Records
              </h2>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Sorting session logs, classification result, and production
              accuracy.
            </p>
          </div>
        </div>

        <ActivityTable data={filteredReports} />
      </section>
    </div>
  );
}