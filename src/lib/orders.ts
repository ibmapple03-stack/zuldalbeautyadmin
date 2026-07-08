import { supabase } from "./supabase";
import { Order, OrderItem, OrderStats, OrderStatus, OrderStatusEvent, PaymentStatus } from "./types";
import { sanitizeSearchTerm } from "./search";

interface OrderRow {
  id: string;
  order_number: string;
  customer_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  payment_method: string;
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_reference: string | null;
  tracking_number: string | null;
  courier: string | null;
  admin_notes: string | null;
  created_at: string;
}

interface OrderItemRow {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  price: number;
  cost_price: number | null;
  quantity: number;
}

interface OrderStatusEventRow {
  id: string;
  order_id: string;
  status: string;
  note: string | null;
  created_at: string;
}

function rowToOrder(row: OrderRow, items: OrderItem[] = []): Order {
  return {
    id: row.id,
    orderNumber: row.order_number,
    customerName: row.customer_name,
    email: row.email,
    phone: row.phone,
    address: row.address,
    city: row.city,
    state: row.state,
    paymentMethod: row.payment_method,
    subtotal: row.subtotal,
    shipping: row.shipping,
    total: row.total,
    status: row.status,
    paymentStatus: row.payment_status,
    paymentReference: row.payment_reference,
    trackingNumber: row.tracking_number,
    courier: row.courier,
    adminNotes: row.admin_notes,
    createdAt: row.created_at,
    items,
  };
}

function rowToOrderItem(row: OrderItemRow): OrderItem {
  return {
    id: row.id,
    productId: row.product_id,
    productName: row.product_name,
    price: row.price,
    costPrice: row.cost_price,
    quantity: row.quantity,
  };
}

export function orderProfit(order: Order): number {
  return order.items.reduce(
    (sum, item) => sum + (item.price - (item.costPrice ?? item.price)) * item.quantity,
    0
  );
}

function rowToStatusEvent(row: OrderStatusEventRow): OrderStatusEvent {
  return {
    id: row.id,
    orderId: row.order_id,
    status: row.status,
    note: row.note,
    createdAt: row.created_at,
  };
}

export async function fetchOrdersPage(opts: {
  status?: OrderStatus | "all";
  search?: string;
  page: number;
  pageSize: number;
}): Promise<{ orders: Order[]; totalCount: number }> {
  const { status, search, page, pageSize } = opts;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase.from("orders").select("*", { count: "exact" });

  if (status && status !== "all") query = query.eq("status", status);
  if (search && search.trim()) {
    const term = sanitizeSearchTerm(search);
    if (term) {
      query = query.or(
        `order_number.ilike.%${term}%,customer_name.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%`
      );
    }
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error || !data) {
    if (error) console.error("Failed to fetch orders:", error.message);
    return { orders: [], totalCount: 0 };
  }

  return {
    orders: (data as OrderRow[]).map((row) => rowToOrder(row)),
    totalCount: count ?? 0,
  };
}

export async function fetchOrderById(id: string): Promise<Order | null> {
  const { data: orderRow, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (orderError || !orderRow) {
    if (orderError) console.error("Failed to fetch order:", orderError.message);
    return null;
  }

  const { data: itemRows, error: itemsError } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", id);

  if (itemsError) console.error("Failed to fetch order items:", itemsError.message);

  return rowToOrder(
    orderRow as OrderRow,
    ((itemRows as OrderItemRow[]) ?? []).map(rowToOrderItem)
  );
}

export async function fetchOrderStatusEvents(orderId: string): Promise<OrderStatusEvent[]> {
  const { data, error } = await supabase
    .from("order_status_events")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    if (error) console.error("Failed to fetch order status events:", error.message);
    return [];
  }
  return (data as OrderStatusEventRow[]).map(rowToStatusEvent);
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  note?: string
): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc("update_order_status", {
    p_order_id: orderId,
    p_status: status,
    p_note: note ?? null,
  });

  return { error: error?.message ?? null };
}

export async function setOrderPaymentStatus(
  orderId: string,
  paymentStatus: PaymentStatus
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("orders")
    .update({ payment_status: paymentStatus })
    .eq("id", orderId);

  return { error: error?.message ?? null };
}

export async function updateOrderTracking(
  orderId: string,
  fields: { trackingNumber?: string; courier?: string; adminNotes?: string }
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("orders")
    .update({
      tracking_number: fields.trackingNumber?.trim() || null,
      courier: fields.courier?.trim() || null,
      admin_notes: fields.adminNotes?.trim() || null,
    })
    .eq("id", orderId);

  return { error: error?.message ?? null };
}

export async function fetchOrderStats(): Promise<OrderStats | null> {
  const { data, error } = await supabase.rpc("order_stats").single();

  if (error || !data) {
    if (error) console.error("Failed to fetch order stats:", error.message);
    return null;
  }

  const row = data as {
    total_orders: number;
    pending_orders: number;
    processing_orders: number;
    shipped_orders: number;
    delivered_orders: number;
    cancelled_orders: number;
    revenue_today: number;
    revenue_month: number;
    revenue_total: number;
    profit_today: number;
    profit_month: number;
    profit_total: number;
  };

  return {
    totalOrders: Number(row.total_orders),
    pendingOrders: Number(row.pending_orders),
    processingOrders: Number(row.processing_orders),
    shippedOrders: Number(row.shipped_orders),
    deliveredOrders: Number(row.delivered_orders),
    cancelledOrders: Number(row.cancelled_orders),
    revenueToday: Number(row.revenue_today),
    revenueMonth: Number(row.revenue_month),
    revenueTotal: Number(row.revenue_total),
    profitToday: Number(row.profit_today),
    profitMonth: Number(row.profit_month),
    profitTotal: Number(row.profit_total),
  };
}
