import Icon from "@/components/icons";
import { IconName } from "@/lib/types";

export default function StatCard({
  label,
  value,
  icon,
  tone = "default",
}: {
  label: string;
  value: string;
  icon: IconName;
  tone?: "default" | "warning" | "danger";
}) {
  const toneClasses = {
    default: "bg-brand-brown/10 text-brand-brown",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-red-100 text-red-600",
  }[tone];

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-brand-black/10 bg-brand-white p-5">
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${toneClasses}`}>
        <Icon name={icon} className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs font-accent font-medium uppercase tracking-wide text-brand-black/50">
          {label}
        </p>
        <p className="mt-0.5 truncate font-heading text-2xl text-brand-black">{value}</p>
      </div>
    </div>
  );
}
