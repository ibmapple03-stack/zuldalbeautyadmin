"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";
import Icon from "@/components/icons";
import { IconName } from "@/lib/types";
import { fetchUnreadMessageCount } from "@/lib/messages";

const navItems: { href: string; label: string; icon: IconName }[] = [
  { href: "/dashboard", label: "Dashboard", icon: "grid" },
  { href: "/orders", label: "Orders", icon: "truck" },
  { href: "/products", label: "Products", icon: "box" },
  { href: "/messages", label: "Messages", icon: "chat" },
  { href: "/settings", label: "Settings", icon: "gear" },
];

function NavLinks({ unread, onNavigate }: { unread: number; onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      {navItems.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-brand-brown text-brand-white"
                : "text-brand-black/70 hover:bg-brand-cream"
            }`}
          >
            <span className="flex items-center gap-3">
              <Icon name={item.icon} className="h-5 w-5" />
              {item.label}
            </span>
            {item.href === "/messages" && unread > 0 && (
              <span className="rounded-full bg-brand-gold px-2 py-0.5 text-[11px] font-semibold text-brand-white">
                {unread}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export default function Sidebar({
  mobileOpen = false,
  onMobileClose,
}: {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}) {
  const pathname = usePathname();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetchUnreadMessageCount().then((count) => {
      if (!cancelled) setUnread(count);
    });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-brand-black/10 bg-brand-white md:flex">
        <div className="border-b border-brand-black/10 px-5 py-5">
          <Logo variant="full" />
        </div>
        <NavLinks unread={unread} />
        <div className="border-t border-brand-black/10 p-4 text-center text-[11px] text-brand-black/40">
          Zuldal Admin
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={onMobileClose} />
          <aside className="relative flex w-72 max-w-[80%] flex-col bg-brand-white shadow-xl">
            <div className="flex items-center justify-between border-b border-brand-black/10 px-5 py-5">
              <Logo variant="full" />
              <button
                onClick={onMobileClose}
                aria-label="Close menu"
                className="flex h-8 w-8 items-center justify-center rounded-full text-brand-black/50 hover:bg-brand-cream"
              >
                <Icon name="close" className="h-4 w-4" />
              </button>
            </div>
            <NavLinks unread={unread} onNavigate={onMobileClose} />
            <div className="border-t border-brand-black/10 p-4 text-center text-[11px] text-brand-black/40">
              Zuldal Admin
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
