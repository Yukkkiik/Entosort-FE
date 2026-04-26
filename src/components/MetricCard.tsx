"use client";

interface MetricCardProps {
  variant: "temperature" | "humidity" | "prepupa" | "larva";
  title: string;
  value: number;
  unit?: string;
  trend: "up" | "down" | "stable";
  trendValue: string;
  subtitle: string;
  fill: number;
  animationDelay?: number;
}

export default function MetricCard({
  variant,
  title,
  value,
  unit = "",
  trend,
  trendValue,
  subtitle,
  fill,
  animationDelay = 0,
}: MetricCardProps) {
  const variantStyle = {
    temperature: "bg-orange-50 text-orange-500",
    humidity: "bg-blue-50 text-blue-500",
    prepupa: "bg-lime-50 text-lime-600",
    larva: "bg-emerald-50 text-emerald-600",
  };

  const trendStyle = {
    up: "text-emerald-500",
    down: "text-red-500",
    stable: "text-gray-400",
  };

  return (
    <div
      className="rounded-3xl bg-white border border-gray-100/80 shadow-[0_2px_20px_rgba(0,0,0,0.05)] p-5 opacity-0 animate-[fadeSlideUp_0.5s_ease_forwards]"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-bold text-gray-500">{title}</p>
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${variantStyle[variant]}`}>
          {variant}
        </span>
      </div>

      <h3 className="text-3xl font-black text-gray-900">
        {value}
        {unit && <span className="ml-1 text-sm text-gray-400">{unit}</span>}
      </h3>

      <p className="mt-1 text-xs text-gray-400">{subtitle}</p>

      <div className="mt-4 h-2 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-lime-400 transition-all duration-1000"
          style={{ width: `${fill}%` }}
        />
      </div>

      <p className={`mt-3 text-xs font-bold ${trendStyle[trend]}`}>
        {trendValue} · {trend}
      </p>
    </div>
  );
}