import { supabase } from "./supabase";
import { SupportMessage } from "./types";

interface SupportMessageRow {
  id: string;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

function rowToMessage(row: SupportMessageRow): SupportMessage {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    message: row.message,
    isRead: row.is_read,
    createdAt: row.created_at,
  };
}

export async function fetchMessagesPage(opts: {
  filter?: "all" | "unread";
  page: number;
  pageSize: number;
}): Promise<{ messages: SupportMessage[]; totalCount: number }> {
  const { filter = "all", page, pageSize } = opts;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase.from("support_messages").select("*", { count: "exact" });
  if (filter === "unread") query = query.eq("is_read", false);

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error || !data) {
    if (error) console.error("Failed to fetch support messages:", error.message);
    return { messages: [], totalCount: 0 };
  }

  return {
    messages: (data as SupportMessageRow[]).map(rowToMessage),
    totalCount: count ?? 0,
  };
}

export async function fetchUnreadMessageCount(): Promise<number> {
  const { count, error } = await supabase
    .from("support_messages")
    .select("*", { count: "exact", head: true })
    .eq("is_read", false);

  if (error) {
    console.error("Failed to fetch unread message count:", error.message);
    return 0;
  }
  return count ?? 0;
}

export async function setMessageRead(id: string, isRead: boolean): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("support_messages")
    .update({ is_read: isRead })
    .eq("id", id);

  return { error: error?.message ?? null };
}
