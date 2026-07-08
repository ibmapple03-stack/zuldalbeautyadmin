"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatNaira } from "@/lib/format";
import { fetchOrderStats, fetchOrdersPage } from "@/lib/orders";
import { fetchProductStats } from "@/lib/productQueries";
import { fetchMessagesPage } from "@/lib/messages";
import { Order, OrderStats, ProductStats, SupportMessage } from "@/lib/types";
import StatCard from "@/components/admin/StatCard";
import StatusBadge from "@/components/admin/StatusBadge";
import Icon from "@/components/icons";

function statValue(
  value: number | undefined,
  failedToLoad: boolean,
  formatter: (n: number) => string = String
): string {
  return failedToLoad ? "—" : formatter(value ?? 0);
}

export default function DashboardPage() {
  const [orderStats, setOrderStats] = useState<OrderStats | null>(null);
  const [productStats, setProductStats] = useState<ProductStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recentMessages, setRecentMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchOrderStats(),
      fetchProductStats(),
      fetchOrdersPage({ page: 1, pageSize: 6 }),
      fetchMessagesPage({ filter: "all", page: 1, pageSize: 5 }),
    ]).then(([orders, products, ordersPage, messagesPage]) => {
      setOrderStats(orders);
      setProductStats(products);
      setRecentOrders(ordersPage.orders);
      setRecentMessages(messagesPage.messages);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="py-20 text-center text-sm text-brand-black/50">Loading dashboard...</div>;
  }

  const orderStatsError = orderStats === null;
  const productStatsError = productStats === null;

  return (
    <div className="flex flex-col gap-6">
      {(orderStatsError || productStatsError) && (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <Icon name="alertTriangle" className="h-5 w-5 shrink-0" />
          <p>
            Couldn&apos;t load {orderStatsError && productStatsError
              ? "order or product"
              : orderStatsError
                ? "order"
                : "product"}{" "}
            statistics — the tiles below show &ldquo;&mdash;&rdquo; instead of 0 so you don&apos;t mistake
            a failed load for real data. Check that all Supabase migrations have been run, then refresh.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Revenue Today" value={statValue(orderStats?.revenueToday, orderStatsError, formatNaira)} icon="creditCard" />
        <StatCard label="Profit Today" value={statValue(orderStats?.profitToday, orderStatsError, formatNaira)} icon="trend" />
        <StatCard label="Revenue This Month" value={statValue(orderStats?.revenueMonth, orderStatsError, formatNaira)} icon="creditCard" />
        <StatCard label="Profit This Month" value={statValue(orderStats?.profitMonth, orderStatsError, formatNaira)} icon="trend" />
      </div>
      <p className="-mt-2 text-xs text-brand-black/40">
        Profit only counts orders marked <span className="font-medium">Delivered</span>, using each product&apos;s cost price.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Pending Orders"
          value={statValue(orderStats?.pendingOrders, orderStatsError)}
          icon="clock"
          tone={orderStats && orderStats.pendingOrders > 0 ? "warning" : "default"}
        />
        <StatCard label="Total Orders" value={statValue(orderStats?.totalOrders, orderStatsError)} icon="truck" />
        <StatCard
          label="Low Stock Products"
          value={statValue(productStats?.lowStock, productStatsError)}
          icon="alertTriangle"
          tone={productStats && productStats.lowStock > 0 ? "warning" : "default"}
        />
        <StatCard
          label="Out of Stock"
          value={statValue(productStats?.outOfStock, productStatsError)}
          icon="alertTriangle"
          tone={productStats && productStats.outOfStock > 0 ? "danger" : "default"}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Products" value={statValue(productStats?.totalProducts, productStatsError)} icon="box" />
        <StatCard label="Inventory Value (Cost)" value={statValue(productStats?.inventoryValue, productStatsError, formatNaira)} icon="creditCard" />
      </div>
      <p className="-mt-2 text-xs text-brand-black/40">
        Inventory value is cost price × stock — products without a cost price set contribute ₦0 until you add one.
      </p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-brand-black/10 bg-brand-white p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-lg text-brand-black">Recent Orders</h2>
            <Link href="/orders" className="text-xs font-accent font-semibold text-brand-gold hover:underline">
              View all &rarr;
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="py-8 text-center text-sm text-brand-black/50">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-brand-black/10 text-left text-xs uppercase tracking-wide text-brand-black/40">
                    <th className="pb-2 font-medium">Order</th>
                    <th className="pb-2 font-medium">Customer</th>
                    <th className="pb-2 font-medium">Total</th>
                    <th className="pb-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-brand-black/5 last:border-0">
                      <td className="py-3">
                        <Link href={`/orders/${order.id}`} className="font-medium text-brand-black hover:text-brand-gold">
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="py-3 text-brand-black/70">{order.customerName}</td>
                      <td className="py-3 text-brand-black/70">{formatNaira(order.total)}</td>
                      <td className="py-3">
                        <StatusBadge status={order.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-brand-black/10 bg-brand-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-lg text-brand-black">Recent Messages</h2>
            <Link href="/messages" className="text-xs font-accent font-semibold text-brand-gold hover:underline">
              View all &rarr;
            </Link>
          </div>
          {recentMessages.length === 0 ? (
            <p className="py-8 text-center text-sm text-brand-black/50">No messages yet.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {recentMessages.map((msg) => (
                <li key={msg.id} className="border-b border-brand-black/5 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-brand-black">{msg.name}</p>
                    {!msg.isRead && <span className="h-2 w-2 rounded-full bg-brand-gold" />}
                  </div>
                  <p className="line-clamp-1 text-xs text-brand-black/50">{msg.message}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
