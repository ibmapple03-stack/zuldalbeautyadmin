"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatNaira } from "@/lib/format";
import { fetchOrdersPage } from "@/lib/orders";
import { Order, OrderStatus } from "@/lib/types";
import StatusBadge from "@/components/admin/StatusBadge";
import { orderStatuses, statusLabel } from "@/components/admin/StatusBadge";
import PaymentStatusBadge from "@/components/admin/PaymentStatusBadge";
import Pagination from "@/components/admin/Pagination";
import Icon from "@/components/icons";

const PAGE_SIZE = 15;

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(true);
      fetchOrdersPage({ status, search, page, pageSize: PAGE_SIZE }).then((result) => {
        setOrders(result.orders);
        setTotalCount(result.totalCount);
        setLoading(false);
      });
    }, 250);
    return () => clearTimeout(timeout);
  }, [status, search, page]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-brand-black/10 bg-brand-white p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Icon
            name="search"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-black/30"
          />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search order #, customer, email or phone..."
            className="w-full rounded-lg border border-brand-black/15 bg-brand-cream/40 py-2.5 pl-9 pr-3.5 text-sm text-brand-black placeholder:text-brand-black/30 focus:border-brand-gold focus:outline-none"
          />
        </div>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as OrderStatus | "all");
            setPage(1);
          }}
          className="rounded-lg border border-brand-black/15 bg-brand-white px-3.5 py-2.5 text-sm text-brand-black focus:border-brand-gold focus:outline-none"
        >
          <option value="all">All Statuses</option>
          {orderStatuses.map((s) => (
            <option key={s} value={s}>
              {statusLabel(s)}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-2xl border border-brand-black/10 bg-brand-white p-4">
        {loading ? (
          <p className="py-16 text-center text-sm text-brand-black/50">Loading orders...</p>
        ) : orders.length === 0 ? (
          <p className="py-16 text-center text-sm text-brand-black/50">No orders match your filters.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-brand-black/10 text-left text-xs uppercase tracking-wide text-brand-black/40">
                  <th className="pb-2 font-medium">Order</th>
                  <th className="pb-2 font-medium">Customer</th>
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium">Payment</th>
                  <th className="pb-2 font-medium">Total</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-brand-black/5 last:border-0">
                    <td className="py-3 font-medium text-brand-black">{order.orderNumber}</td>
                    <td className="py-3">
                      <p className="text-brand-black">{order.customerName}</p>
                      <p className="text-xs text-brand-black/40">{order.email}</p>
                    </td>
                    <td className="py-3 text-brand-black/60">
                      {new Date(order.createdAt).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3">
                      <p className="capitalize text-brand-black/60">{order.paymentMethod}</p>
                      <div className="mt-1">
                        <PaymentStatusBadge status={order.paymentStatus} />
                      </div>
                    </td>
                    <td className="py-3 font-medium text-brand-black">{formatNaira(order.total)}</td>
                    <td className="py-3">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        href={`/orders/${order.id}`}
                        className="font-accent text-xs font-semibold text-brand-gold hover:underline"
                      >
                        View &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} pageSize={PAGE_SIZE} totalCount={totalCount} onPageChange={setPage} />
      </div>
    </div>
  );
}
