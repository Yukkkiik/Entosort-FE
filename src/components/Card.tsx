import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "glass" | "bordered" | "elevated";
  padding?: "sm" | "md" | "lg" | "none";
  hover?: boolean;
}

export default function Card({
  children,
  className,
  variant = "default",
  padding = "md",
  hover = false,
}: CardProps) {
  const variantClasses = {
    default: "bg-white shadow-soft border border-slate-100",
    glass: "glass-card shadow-soft",
    bordered: "bg-white border-2 border-slate-200",
    elevated: "bg-white shadow-soft-md border border-slate-100",
  };

  const paddingClasses = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <div
      className={cn(
        "rounded-2xl transition-all duration-200",
        variantClasses[variant],
        paddingClasses[padding],
        hover && "hover:shadow-soft-md hover:-translate-y-0.5 cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}