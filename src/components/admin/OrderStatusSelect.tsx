import { OrderStatus } from "@/lib/types";
import { orderStatuses, statusLabel } from "./StatusBadge";

export default function OrderStatusSelect({
  value,
  onChange,
  className = "",
}: {
  value: OrderStatus;
  onChange: (status: OrderStatus) => void;
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as OrderStatus)}
      className={`rounded-lg border border-brand-black/15 bg-brand-white px-3.5 py-2.5 text-sm text-brand-black focus:border-brand-gold focus:outline-none ${className}`}
    >
      {orderStatuses.map((status) => (
        <option key={status} value={status}>
          {statusLabel(status)}
        </option>
      ))}
    </select>
  );
}
