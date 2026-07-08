"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Icon from "@/components/icons";

const titles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/orders": "Orders",
  "/products": "Products",
  "/messages": "Messages",
  "/settings": "Settings",
};

function titleFor(pathname: string): string {
  if (titles[pathname]) return titles[pathname];
  const base = "/" + pathname.split("/")[1];
  return titles[base] ?? "Zuldal Admin";
}

export default function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname = usePathname();
  const { profile, signOut } = useAuth();

  return (
    <header className="flex items-center justify-between border-b border-brand-black/10 bg-brand-white px-4 py-4 md:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          aria-label="Open menu"
          className="flex h-9 w-9 items-center justify-center rounded-full text-brand-black/60 hover:bg-brand-cream md:hidden"
        >
          <Icon name="menu" className="h-5 w-5" />
        </button>
        <h1 className="font-heading text-xl text-brand-black md:text-2xl">
          {titleFor(pathname)}
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-brand-black">
            {profile?.fullName || "Admin"}
          </p>
          <p className="text-xs text-brand-black/50">Administrator</p>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-brown text-brand-white">
          <Icon name="user" className="h-4 w-4" />
        </span>
        <button
          onClick={signOut}
          title="Sign out"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-black/15 text-brand-black/60 transition-colors hover:border-brand-gold hover:text-brand-gold"
        >
          <Icon name="logout" className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
