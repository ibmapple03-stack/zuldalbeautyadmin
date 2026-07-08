import { PaymentStatus } from "@/lib/types";

const styles: Record<PaymentStatus, string> = {
  unpaid: "bg-amber-100 text-amber-700",
  paid: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-600",
};

const labels: Record<PaymentStatus, string> = {
  unpaid: "Unpaid",
  paid: "Paid",
  failed: "Payment Failed",
};

export default function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-accent font-semibold ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
