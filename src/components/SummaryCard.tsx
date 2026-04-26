import { LucideIcon, TrendingUp } from "lucide-react";

type SummaryCardProps = {
  icon: LucideIcon;
  value: string;
  label: string;
  trend: string;
};

export default function SummaryCard({
  icon: Icon,
  value,
  label,
  trend,
}: SummaryCardProps) {
  return (
    <article className="group rounded-3xl border border-white/70 bg-white/80 p-5 shadow-xl shadow-lime-950/5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-lime-500/10">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-100 text-lime-700 transition group-hover:scale-110">
          <Icon className="h-6 w-6" />
        </div>

        <span className="inline-flex items-center gap-1 rounded-full bg-lime-50 px-3 py-1 text-xs font-bold text-lime-700">
          <TrendingUp className="h-3.5 w-3.5" />
          {trend}
        </span>
      </div>

      <p className="text-3xl font-black text-gray-950">{value}</p>
      <p className="mt-1 text-sm font-medium text-gray-500">{label}</p>
    </article>
  );
}