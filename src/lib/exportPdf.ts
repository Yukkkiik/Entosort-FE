// lib/exportPdf.ts
// Generates a complete PDF report for harvest history
// Dependencies: jspdf, jspdf-autotable

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { HarvestLog, HarvestStats } from "@/types/harvest";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  });
}

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function fmtDuration(sec: number | null) {
  if (sec == null) return "—";
  return `${Math.floor(sec / 60)}m ${sec % 60}s`;
}

function getStatus(total: number, reject: number) {
  if (total === 0) return "No Data";
  const rate = (reject / total) * 100;
  if (rate > 20) return "Warning";
  if (rate > 5)  return "Perlu Cek";
  return "Normal";
}

// ─── Color palette ────────────────────────────────────────────────────────────

const COLOR = {
  green:      [34, 197, 94]   as [number, number, number],
  greenDark:  [21, 128, 61]   as [number, number, number],
  greenLight: [240, 253, 244] as [number, number, number],
  slate:      [71, 85, 105]   as [number, number, number],
  slateLight: [248, 250, 252] as [number, number, number],
  white:      [255, 255, 255] as [number, number, number],
  gray:       [107, 114, 128] as [number, number, number],
  red:        [239, 68, 68]   as [number, number, number],
  yellow:     [234, 179, 8]   as [number, number, number],
  black:      [15, 23, 42]    as [number, number, number],
};

// ─── Mini bar chart (drawn with PDF primitives) ───────────────────────────────

function drawBarChart(
  doc:    jsPDF,
  data:   { label: string; value: number; color: [number, number, number] }[],
  x:      number,
  y:      number,
  width:  number,
  height: number,
) {
  const max     = Math.max(...data.map((d) => d.value), 1);
  const barW    = (width - (data.length - 1) * 4) / data.length;
  const labelH  = 8;
  const chartH  = height - labelH - 10;

  data.forEach((item, i) => {
    const bx    = x + i * (barW + 4);
    const bh    = (item.value / max) * chartH;
    const by    = y + chartH - bh;

    // Bar
    doc.setFillColor(...item.color);
    doc.roundedRect(bx, by, barW, bh, 2, 2, "F");

    // Value label on top of bar
    doc.setFontSize(7);
    doc.setTextColor(...COLOR.black);
    doc.setFont("helvetica", "bold");
    const valStr = item.value.toLocaleString();
    const tw = doc.getTextWidth(valStr);
    if (bh > 10) {
      doc.text(valStr, bx + barW / 2 - tw / 2, by - 1.5);
    }

    // X-axis label
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLOR.gray);
    const lw = doc.getTextWidth(item.label);
    doc.text(item.label, bx + barW / 2 - lw / 2, y + chartH + labelH);
  });

  // Baseline
  doc.setDrawColor(...COLOR.slateLight);
  doc.setLineWidth(0.3);
  doc.line(x, y + chartH, x + width, y + chartH);
}

// ─── Main export function ─────────────────────────────────────────────────────

export async function exportHarvestPdf(
  logs:    HarvestLog[],
  stats:   HarvestStats,
  filters: { from: string; to: string; nodeId?: string },
) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const PW  = doc.internal.pageSize.getWidth();   // 210
  const PH  = doc.internal.pageSize.getHeight();  // 297

  // ── PAGE 1: Cover ──────────────────────────────────────────────────────────

  // Green header block
  doc.setFillColor(...COLOR.greenDark);
  doc.rect(0, 0, PW, 80, "F");

  // Decorative circle
  doc.setFillColor(...COLOR.green);
  doc.circle(PW - 20, 15, 30, "F");
  doc.setFillColor(255, 255, 255, 0.08);
  doc.circle(PW - 5, 40, 20, "F");

  // Logo placeholder circle
  doc.setFillColor(...COLOR.white);
  doc.circle(30, 30, 12, "F");
  doc.setFontSize(7);
  doc.setTextColor(...COLOR.greenDark);
  doc.setFont("helvetica", "bold");
  doc.text("ENTO", 23, 29);
  doc.text("SORT", 23, 33);

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...COLOR.white);
  doc.text("Laporan Riwayat Produksi", 20, 55);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(200, 240, 200);
  doc.text("EntoSort — Sistem Manajemen Sortir Larva BSF", 20, 63);

  // Date range badge
  doc.setFillColor(...COLOR.green);
  doc.roundedRect(20, 68, PW - 40, 8, 3, 3, "F");
  doc.setFontSize(9);
  doc.setTextColor(...COLOR.white);
  doc.setFont("helvetica", "bold");
  const dateLabel = `Periode: ${fmtDate(filters.from)} — ${fmtDate(filters.to)}${filters.nodeId ? `  |  Node: ${filters.nodeId}` : ""}`;
  doc.text(dateLabel, PW / 2, 73.5, { align: "center" });

  // Generated info
  doc.setFontSize(8);
  doc.setTextColor(...COLOR.gray);
  doc.setFont("helvetica", "normal");
  doc.text(`Digenerate pada: ${fmtDateTime(new Date().toISOString())}`, 20, 90);
  doc.text(`Total records: ${logs.length}`, 20, 96);

  // ── Summary Stats section ──────────────────────────────────────────────────

  const cards = [
    { label: "Total Sesi",    value: stats.totalSessions.toLocaleString(),  color: COLOR.greenDark },
    { label: "Total Larva",   value: stats.totalLarva.toLocaleString(),     color: [37, 99, 235]   as [number,number,number] },
    { label: "Total Prepupa", value: stats.totalPrepupa.toLocaleString(),   color: [124, 58, 237]  as [number,number,number] },
    { label: "Total Reject",  value: stats.totalReject.toLocaleString(),    color: COLOR.red       },
    { label: "Total Sortir",  value: stats.totalHarvested.toLocaleString(), color: COLOR.slate     },
    { label: "Success Rate",  value: `${stats.successRate}%`,               color: [5, 150, 105]   as [number,number,number] },
  ];

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLOR.black);
  doc.text("Ringkasan Statistik", 20, 108);

  // Divider
  doc.setDrawColor(...COLOR.green);
  doc.setLineWidth(0.8);
  doc.line(20, 111, 60, 111);

  const cardW = (PW - 40 - 10) / 3;
  const cardH = 22;
  cards.forEach((card, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const cx  = 20 + col * (cardW + 5);
    const cy  = 115 + row * (cardH + 4);

    // Card background
    doc.setFillColor(...COLOR.slateLight);
    doc.roundedRect(cx, cy, cardW, cardH, 3, 3, "F");

    // Left accent bar
    doc.setFillColor(...card.color);
    doc.roundedRect(cx, cy, 3, cardH, 1.5, 1.5, "F");

    // Value
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...card.color);
    doc.text(card.value, cx + 8, cy + 10);

    // Label
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLOR.gray);
    doc.text(card.label, cx + 8, cy + 17);
  });

  // ── Bar chart ─────────────────────────────────────────────────────────────

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLOR.black);
  doc.text("Distribusi Klasifikasi", 20, 174);
  doc.setDrawColor(...COLOR.green);
  doc.setLineWidth(0.8);
  doc.line(20, 177, 75, 177);

  drawBarChart(
    doc,
    [
      { label: "Larva",   value: stats.totalLarva,   color: [37, 99, 235]  },
      { label: "Prepupa", value: stats.totalPrepupa, color: [124, 58, 237] },
      { label: "Reject",  value: stats.totalReject,  color: COLOR.red      },
    ],
    20, 180, PW - 40, 50,
  );

  // ── Avg per session ────────────────────────────────────────────────────────

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLOR.black);
  doc.text("Rata-rata per Sesi", 20, 240);
  doc.setDrawColor(...COLOR.green);
  doc.setLineWidth(0.5);
  doc.line(20, 243, 62, 243);

  const avgRows = [
    ["Larva / sesi",   `${stats.avgLarvaPerSession.toLocaleString()} ekor`],
    ["Prepupa / sesi", `${stats.avgPrepupaPerSession.toLocaleString()} ekor`],
    ["Success rate",   `${stats.successRate}%`],
  ];

  avgRows.forEach(([label, val], i) => {
    const ry = 249 + i * 8;
    doc.setFillColor(...COLOR.slateLight);
    doc.roundedRect(20, ry - 4, PW - 40, 7, 2, 2, "F");
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLOR.slate);
    doc.text(label, 25, ry);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLOR.greenDark);
    doc.text(val, PW - 25, ry, { align: "right" });
  });

  // Footer page 1
  doc.setFontSize(7.5);
  doc.setTextColor(...COLOR.gray);
  doc.setFont("helvetica", "normal");
  doc.text("EntoSort — Sistem Sortir Larva BSF", PW / 2, PH - 8, { align: "center" });
  doc.text("1", PW - 15, PH - 8);

  // ── PAGE 2: Data Table ─────────────────────────────────────────────────────

  doc.addPage();

  // Page 2 header
  doc.setFillColor(...COLOR.greenDark);
  doc.rect(0, 0, PW, 18, "F");
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLOR.white);
  doc.text("Detail Log Sortir", 15, 12);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(200, 240, 200);
  doc.text(`${logs.length} records  •  ${fmtDate(filters.from)} — ${fmtDate(filters.to)}`, PW - 15, 12, { align: "right" });

  // Table
  autoTable(doc, {
    startY: 24,
    head: [[
      "Waktu", "Node", "Larva", "Prepupa", "Reject", "Total", "Durasi", "Status",
    ]],
    body: logs.map((row) => [
      fmtDateTime(row.recordedAt),
      row.nodeId,
      row.larvaCount.toLocaleString(),
      row.prepupaCount.toLocaleString(),
      row.rejectCount.toLocaleString(),
      row.totalCount.toLocaleString(),
      fmtDuration(row.durationSec),
      getStatus(row.totalCount, row.rejectCount),
    ]),
    headStyles: {
      fillColor:  COLOR.greenDark,
      textColor:  COLOR.white,
      fontStyle:  "bold",
      fontSize:   8,
      cellPadding: 4,
    },
    bodyStyles: {
      fontSize:    8,
      cellPadding: 3.5,
      textColor:   COLOR.slate,
    },
    alternateRowStyles: {
      fillColor: COLOR.slateLight,
    },
    columnStyles: {
      0: { cellWidth: 34 },
      1: { cellWidth: 24, fontStyle: "bold" },
      2: { halign: "right" },
      3: { halign: "right" },
      4: { halign: "right", textColor: COLOR.red },
      5: { halign: "right", fontStyle: "bold", textColor: COLOR.greenDark },
      6: { halign: "center" },
      7: { halign: "center" },
    },
    didDrawCell: (hookData) => {
      // Color status cell
      if (hookData.section === "body" && hookData.column.index === 7) {
        const val = hookData.cell.text[0];
        const colors: Record<string, [number, number, number]> = {
          "Normal":    [240, 253, 244],
          "Perlu Cek": [254, 252, 232],
          "Warning":   [254, 242, 242],
          "No Data":   [248, 250, 252],
        };
        if (colors[val]) {
          doc.setFillColor(...colors[val]);
          doc.rect(
            hookData.cell.x, hookData.cell.y,
            hookData.cell.width, hookData.cell.height,
            "F"
          );
          const textColors: Record<string, [number, number, number]> = {
            "Normal":    COLOR.greenDark,
            "Perlu Cek": [161, 98, 7],
            "Warning":   COLOR.red,
            "No Data":   COLOR.gray,
          };
          doc.setTextColor(...(textColors[val] ?? COLOR.gray));
          doc.setFontSize(7.5);
          doc.setFont("helvetica", "bold");
          doc.text(
            val,
            hookData.cell.x + hookData.cell.width / 2,
            hookData.cell.y + hookData.cell.height / 2 + 1,
            { align: "center" }
          );
        }
      }
    },
    // Footer tiap halaman
    didDrawPage: (hookData) => {
      const pageNum = (doc as any).internal.getCurrentPageInfo().pageNumber;
      doc.setFontSize(7.5);
      doc.setTextColor(...COLOR.gray);
      doc.setFont("helvetica", "normal");
      doc.text("EntoSort — Sistem Sortir Larva BSF", PW / 2, PH - 8, { align: "center" });
      doc.text(String(pageNum), PW - 15, PH - 8);
    },
    margin: { left: 15, right: 15, bottom: 15 },
  });

  // ── Save ──────────────────────────────────────────────────────────────────

  const filename = `laporan-sortir_${filters.from}_${filters.to}.pdf`;
  doc.save(filename);
}