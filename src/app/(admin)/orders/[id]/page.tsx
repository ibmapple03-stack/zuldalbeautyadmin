"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { formatNaira } from "@/lib/format";
import {
  fetchOrderById,
  fetchOrderStatusEvents,
  orderProfit,
  setOrderPaymentStatus,
  updateOrderStatus,
  updateOrderTracking,
} from "@/lib/orders";
import { Order, OrderStatus, OrderStatusEvent } from "@/lib/types";
import StatusBadge from "@/components/admin/StatusBadge";
import PaymentStatusBadge from "@/components/admin/PaymentStatusBadge";
import OrderStatusSelect from "@/components/admin/OrderStatusSelect";
import OrderTimeline from "@/components/admin/OrderTimeline";
import BackButton from "@/components/BackButton";
import Icon from "@/components/icons";

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [events, setEvents] = useState<OrderStatusEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  const [pendingStatus, setPendingStatus] = useState<OrderStatus>("pending");
  const [statusNote, setStatusNote] = useState("");
  const [savingStatus, setSavingStatus] = useState(false);

  const [trackingNumber, setTrackingNumber] = useState("");
  const [courier, setCourier] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [savingTracking, setSavingTracking] = useState(false);
  const [trackingSaved, setTrackingSaved] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const timeout = setTimeout(() => {
      setLoading(true);
      Promise.all([fetchOrderById(params.id), fetchOrderStatusEvents(params.id)]).then(
        ([orderData, eventData]) => {
          if (cancelled) return;
          if (!orderData) {
            setNotFound(true);
            setLoading(false);
            return;
          }
          setOrder(orderData);
          setEvents(eventData);
          setPendingStatus(orderData.status);
          setTrackingNumber(orderData.trackingNumber ?? "");
          setCourier(orderData.courier ?? "");
          setAdminNotes(orderData.adminNotes ?? "");
          setLoading(false);
        }
      );
    }, 0);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [params.id, reloadToken]);

  async function handleStatusUpdate() {
    if (!order) return;
    setSavingStatus(true);
    const { error } = await updateOrderStatus(order.id, pendingStatus, statusNote);
    if (!error) {
      setStatusNote("");
      setReloadToken((t) => t + 1);
    }
    setSavingStatus(false);
  }

  async function handleConfirm() {
    if (!order) return;
    setSavingStatus(true);
    const { error } = await updateOrderStatus(order.id, "processing", "Order confirmed by admin");
    if (!error) setReloadToken((t) => t + 1);
    setSavingStatus(false);
  }

  async function handleMarkPayment(paid: boolean) {
    if (!order) return;
    setSavingPayment(true);
    const { error } = await setOrderPaymentStatus(order.id, paid ? "paid" : "unpaid");
    if (!error) setReloadToken((t) => t + 1);
    setSavingPayment(false);
  }

  async function handleTrackingSave() {
    if (!order) return;
    setSavingTracking(true);
    setTrackingSaved(false);
    const { error } = await updateOrderTracking(order.id, { trackingNumber, courier, adminNotes });
    if (!error) {
      setTrackingSaved(true);
      setReloadToken((t) => t + 1);
    }
    setSavingTracking(false);
  }

  if (loading) {
    return <p className="py-20 text-center text-sm text-brand-black/50">Loading order...</p>;
  }

  if (notFound || !order) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <p className="text-sm text-brand-black/50">Order not found.</p>
        <BackButton fallbackHref="/orders" />
      </div>
    );
  }

  const isOnlinePayment = order.paymentMethod === "card" || order.paymentMethod === "transfer";
  const onlinePaymentUnpaid = isOnlinePayment && order.paymentStatus !== "paid";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <BackButton fallbackHref="/orders" />
          <h1 className="font-heading text-2xl text-brand-black">{order.orderNumber}</h1>
          <StatusBadge status={order.status} />
          <PaymentStatusBadge status={order.paymentStatus} />
        </div>
        {order.status === "pending" && !onlinePaymentUnpaid && (
          <button
            onClick={handleConfirm}
            disabled={savingStatus}
            className="flex items-center gap-2 rounded-full bg-brand-brown px-5 py-2.5 font-accent text-sm font-semibold text-brand-white hover:bg-brand-gold disabled:opacity-60"
          >
            <Icon name="check" className="h-4 w-4" />
            Confirm Order
          </button>
        )}
      </div>

      {order.status === "pending" && onlinePaymentUnpaid && (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <Icon name="alertTriangle" className="h-5 w-5 shrink-0" />
          <p>
            This {order.paymentMethod === "card" ? "card" : "bank transfer"} payment hasn&apos;t
            been confirmed as paid yet, so one-click confirmation is disabled. If you&apos;re
            certain it&apos;s fine to proceed, use <span className="font-medium">Update Status</span> to override.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <section className="rounded-2xl border border-brand-black/10 bg-brand-white p-6">
            <h2 className="font-heading text-lg text-brand-black">Items</h2>
            <div className="mt-4 flex flex-col divide-y divide-brand-black/5">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-brand-black">{item.productName}</p>
                    <p className="text-xs text-brand-black/50">
                      {formatNaira(item.price)} &times; {item.quantity}
                    </p>
                  </div>
                  <span className="text-sm font-accent font-medium text-brand-black">
                    {formatNaira(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-col gap-2 border-t border-brand-black/10 pt-4 text-sm">
              <div className="flex justify-between text-brand-black/70">
                <span>Subtotal</span>
                <span>{formatNaira(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-brand-black/70">
                <span>Shipping</span>
                <span>{order.shipping === 0 ? "Free" : formatNaira(order.shipping)}</span>
              </div>
              <div className="flex justify-between border-t border-brand-black/10 pt-2 font-accent font-semibold text-brand-black">
                <span>Total</span>
                <span>{formatNaira(order.total)}</span>
              </div>
              {order.status === "delivered" && (
                <div className="flex justify-between border-t border-brand-black/10 pt-2 text-green-700">
                  <span>Profit (delivered)</span>
                  <span className="font-accent font-semibold">{formatNaira(orderProfit(order))}</span>
                </div>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-brand-black/10 bg-brand-white p-6">
            <h2 className="font-heading text-lg text-brand-black">Customer &amp; Shipping</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <InfoRow icon="user" label="Customer" value={order.customerName} />
              <InfoRow icon="mail" label="Email" value={order.email} />
              <InfoRow icon="creditCard" label="Phone" value={order.phone} />
              <InfoRow icon="creditCard" label="Payment Method" value={order.paymentMethod} capitalize />
              <InfoRow
                icon="mapPin"
                label="Delivery Address"
                value={`${order.address}, ${order.city}, ${order.state}`}
                full
              />
            </div>
          </section>

          <section className="rounded-2xl border border-brand-black/10 bg-brand-white p-6">
            <h2 className="font-heading text-lg text-brand-black">Payment</h2>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <PaymentStatusBadge status={order.paymentStatus} />
                {order.paymentReference && (
                  <p className="mt-1.5 text-xs text-brand-black/50">
                    Reference: {order.paymentReference}
                  </p>
                )}
              </div>
              {!isOnlinePayment && (
                <button
                  onClick={() => handleMarkPayment(order.paymentStatus !== "paid")}
                  disabled={savingPayment}
                  className="rounded-full border border-brand-black/15 px-4 py-2 font-accent text-xs font-semibold text-brand-black hover:border-brand-gold hover:text-brand-gold disabled:opacity-60"
                >
                  {savingPayment
                    ? "Saving..."
                    : order.paymentStatus === "paid"
                      ? "Mark as Unpaid"
                      : "Mark as Paid"}
                </button>
              )}
            </div>
            {isOnlinePayment ? (
              <p className="mt-3 text-xs text-brand-black/40">
                {order.paymentMethod === "card" ? "Card" : "Bank transfer"} payments are verified
                automatically by Paystack — this can&apos;t be toggled manually.
              </p>
            ) : (
              <p className="mt-3 text-xs text-brand-black/40">
                Pay on delivery orders aren&apos;t verified automatically — mark this once
                you&apos;ve confirmed payment yourself.
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-brand-black/10 bg-brand-white p-6">
            <h2 className="font-heading text-lg text-brand-black">Shipment Tracking</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-accent text-xs font-medium text-brand-black/70">Courier</span>
                <input
                  value={courier}
                  onChange={(e) => setCourier(e.target.value)}
                  placeholder="e.g. GIG Logistics"
                  className="rounded-lg border border-brand-black/15 bg-brand-cream/40 px-3.5 py-2.5 text-sm text-brand-black placeholder:text-brand-black/30 focus:border-brand-gold focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-accent text-xs font-medium text-brand-black/70">Tracking Number</span>
                <input
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. GIG-2093481"
                  className="rounded-lg border border-brand-black/15 bg-brand-cream/40 px-3.5 py-2.5 text-sm text-brand-black placeholder:text-brand-black/30 focus:border-brand-gold focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
                <span className="font-accent text-xs font-medium text-brand-black/70">Internal Notes</span>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  placeholder="Notes only visible to admins..."
                  className="rounded-lg border border-brand-black/15 bg-brand-cream/40 px-3.5 py-2.5 text-sm text-brand-black placeholder:text-brand-black/30 focus:border-brand-gold focus:outline-none"
                />
              </label>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={handleTrackingSave}
                disabled={savingTracking}
                className="rounded-full bg-brand-brown px-5 py-2.5 font-accent text-sm font-semibold text-brand-white hover:bg-brand-gold disabled:opacity-60"
              >
                {savingTracking ? "Saving..." : "Save Tracking Info"}
              </button>
              {trackingSaved && <span className="text-xs text-green-600">Saved.</span>}
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-6">
          <section className="rounded-2xl border border-brand-black/10 bg-brand-white p-6">
            <h2 className="font-heading text-lg text-brand-black">Update Status</h2>
            <div className="mt-4 flex flex-col gap-3">
              <OrderStatusSelect value={pendingStatus} onChange={setPendingStatus} />
              <textarea
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                rows={2}
                placeholder="Optional note (visible in tracking history)"
                className="rounded-lg border border-brand-black/15 bg-brand-cream/40 px-3.5 py-2.5 text-sm text-brand-black placeholder:text-brand-black/30 focus:border-brand-gold focus:outline-none"
              />
              <button
                onClick={handleStatusUpdate}
                disabled={savingStatus || pendingStatus === order.status}
                className="rounded-full bg-brand-brown px-5 py-2.5 font-accent text-sm font-semibold text-brand-white hover:bg-brand-gold disabled:opacity-60"
              >
                {savingStatus ? "Updating..." : "Update Status"}
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-brand-black/10 bg-brand-white p-6">
            <h2 className="font-heading text-lg text-brand-black">Tracking Timeline</h2>
            <div className="mt-4">
              <OrderTimeline events={events} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  capitalize,
  full,
}: {
  icon: "user" | "mail" | "mapPin" | "creditCard";
  label: string;
  value: string;
  capitalize?: boolean;
  full?: boolean;
}) {
  return (
    <div className={`flex items-start gap-3 ${full ? "sm:col-span-2" : ""}`}>
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-cream text-brand-brown">
        <Icon name={icon} className="h-4 w-4" />
      </span>
      <div>
        <p className="text-xs text-brand-black/50">{label}</p>
        <p className={`text-sm text-brand-black ${capitalize ? "capitalize" : ""}`}>{value}</p>
      </div>
    </div>
  );
}
