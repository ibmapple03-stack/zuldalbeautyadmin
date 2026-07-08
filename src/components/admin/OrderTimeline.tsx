import { OrderStatusEvent } from "@/lib/types";
import { statusLabel } from "./StatusBadge";
import Icon from "@/components/icons";

export default function OrderTimeline({ events }: { events: OrderStatusEvent[] }) {
  if (events.length === 0) {
    return <p className="text-sm text-brand-black/50">No tracking history yet.</p>;
  }

  return (
    <ol className="flex flex-col gap-5">
      {events.map((event, idx) => (
        <li key={event.id} className="relative flex gap-3 pl-1">
          {idx < events.length - 1 && (
            <span className="absolute left-[11px] top-6 h-full w-px bg-brand-black/10" />
          )}
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-gold/20 text-brand-brown">
            <Icon name="clock" className="h-3.5 w-3.5" />
          </span>
          <div>
            <p className="text-sm font-medium text-brand-black">
              {statusLabel(event.status)}
            </p>
            {event.note && (
              <p className="mt-0.5 text-sm text-brand-black/60">{event.note}</p>
            )}
            <p className="mt-0.5 text-xs text-brand-black/40">
              {new Date(event.createdAt).toLocaleString("en-NG", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
