"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { NavigationHistoryProvider } from "@/context/NavigationHistoryContext";
import Sidebar from "@/components/admin/Sidebar";
import Topbar from "@/components/admin/Topbar";
import Icon from "@/components/icons";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { session, loading, isAdmin, signOut } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (!loading && !session) router.replace("/");
  }, [loading, session, router]);

  if (loading || !session) {
    return <div className="flex min-h-screen items-center justify-center bg-brand-cream" />;
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-brand-cream px-6 text-center">
        <Icon name="alertTriangle" className="h-10 w-10 text-red-500" />
        <h1 className="font-heading text-2xl text-brand-black">Access Denied</h1>
        <p className="max-w-sm text-sm text-brand-black/60">
          This account isn&apos;t set up as an admin for Zuldal Beauty &amp;
          Wellness.
        </p>
        <button
          onClick={signOut}
          className="rounded-full bg-brand-brown px-6 py-2.5 font-accent text-sm font-semibold text-brand-white hover:bg-brand-gold"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <NavigationHistoryProvider>
      <div className="flex min-h-screen bg-brand-cream">
        <Sidebar mobileOpen={mobileNavOpen} onMobileClose={() => setMobileNavOpen(false)} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar onMenuClick={() => setMobileNavOpen(true)} />
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>
    </NavigationHistoryProvider>
  );
}
