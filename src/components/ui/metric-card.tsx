import type { LucideIcon } from "lucide-react";

type MetricCardProps = {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
};

export function MetricCard({ title, value, change, icon: Icon }: MetricCardProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-600">{title}</p>
        <Icon className="size-5 text-signal" />
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-normal text-ink">{value}</p>
      <p className="mt-2 text-sm text-emerald">{change}</p>
    </div>
  );
}
