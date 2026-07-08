"use client";

import { useEffect, useState } from "react";
import { fetchMessagesPage, setMessageRead } from "@/lib/messages";
import { SupportMessage } from "@/lib/types";
import Pagination from "@/components/admin/Pagination";
import Icon from "@/components/icons";

const PAGE_SIZE = 12;

export default function MessagesPage() {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const timeout = setTimeout(() => {
      setLoading(true);
      fetchMessagesPage({ filter, page, pageSize: PAGE_SIZE }).then((result) => {
        if (cancelled) return;
        setMessages(result.messages);
        setTotalCount(result.totalCount);
        setLoading(false);
      });
    }, 0);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [filter, page]);

  async function toggleOpen(message: SupportMessage) {
    const opening = openId !== message.id;
    setOpenId(opening ? message.id : null);
    if (opening && !message.isRead) {
      const { error } = await setMessageRead(message.id, true);
      if (error) {
        console.error("Failed to mark message read:", error);
        return;
      }
      setMessages((prev) => prev.map((m) => (m.id === message.id ? { ...m, isRead: true } : m)));
    }
  }

  async function toggleRead(message: SupportMessage) {
    const { error } = await setMessageRead(message.id, !message.isRead);
    if (error) {
      console.error("Failed to update message read state:", error);
      return;
    }
    setMessages((prev) =>
      prev.map((m) => (m.id === message.id ? { ...m, isRead: !message.isRead } : m))
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 rounded-2xl border border-brand-black/10 bg-brand-white p-4">
        {(["all", "unread"] as const).map((f) => (
          <button
            key={f}
            onClick={() => {
              setFilter(f);
              setPage(1);
            }}
            className={`rounded-full px-4 py-2 font-accent text-xs font-semibold capitalize transition-colors ${
              filter === f
                ? "bg-brand-brown text-brand-white"
                : "text-brand-black/60 hover:bg-brand-cream"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-brand-black/10 bg-brand-white p-4">
        {loading ? (
          <p className="py-16 text-center text-sm text-brand-black/50">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="py-16 text-center text-sm text-brand-black/50">No messages here.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-brand-black/5">
            {messages.map((message) => (
              <li key={message.id} className="py-3">
                <button
                  onClick={() => toggleOpen(message)}
                  className="flex w-full items-center justify-between gap-3 text-left"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {!message.isRead && <span className="h-2 w-2 shrink-0 rounded-full bg-brand-gold" />}
                    <div className="min-w-0">
                      <p className={`truncate text-sm ${message.isRead ? "text-brand-black/70" : "font-semibold text-brand-black"}`}>
                        {message.name}
                      </p>
                      <p className="truncate text-xs text-brand-black/40">{message.email}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-xs text-brand-black/40">
                      {new Date(message.createdAt).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                    <Icon
                      name="chevronDown"
                      className={`h-4 w-4 text-brand-black/30 transition-transform ${openId === message.id ? "rotate-180" : ""}`}
                    />
                  </div>
                </button>
                {openId === message.id && (
                  <div className="mt-3 rounded-xl bg-brand-cream/50 p-4">
                    <p className="whitespace-pre-wrap text-sm text-brand-black/80">{message.message}</p>
                    <div className="mt-3 flex items-center gap-3">
                      <a
                        href={`mailto:${message.email}`}
                        className="rounded-full bg-brand-brown px-4 py-2 font-accent text-xs font-semibold text-brand-white hover:bg-brand-gold"
                      >
                        Reply by Email
                      </a>
                      <button
                        onClick={() => toggleRead(message)}
                        className="rounded-full border border-brand-black/15 px-4 py-2 font-accent text-xs font-semibold text-brand-black/60 hover:border-brand-gold hover:text-brand-gold"
                      >
                        Mark as {message.isRead ? "Unread" : "Read"}
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
        <Pagination page={page} pageSize={PAGE_SIZE} totalCount={totalCount} onPageChange={setPage} />
      </div>
    </div>
  );
}
