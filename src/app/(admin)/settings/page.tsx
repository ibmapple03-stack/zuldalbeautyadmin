"use client";

import { useAuth } from "@/context/AuthContext";
import Icon from "@/components/icons";

export default function SettingsPage() {
  const { session, profile, signOut } = useAuth();

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-brand-black/10 bg-brand-white p-6">
        <h2 className="font-heading text-lg text-brand-black">Your Account</h2>
        <div className="mt-4 flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-brown text-brand-white">
            <Icon name="user" className="h-6 w-6" />
          </span>
          <div>
            <p className="font-medium text-brand-black">{profile?.fullName || "Admin"}</p>
            <p className="text-sm text-brand-black/50">{session?.user.email}</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="mt-5 flex items-center gap-2 rounded-full border border-brand-black/15 px-5 py-2.5 font-accent text-sm font-semibold text-brand-black hover:border-brand-gold hover:text-brand-gold"
        >
          <Icon name="logout" className="h-4 w-4" />
          Sign Out
        </button>
      </section>

      <section className="rounded-2xl border border-brand-black/10 bg-brand-white p-6">
        <h2 className="font-heading text-lg text-brand-black">Adding Another Admin</h2>
        <p className="mt-2 text-sm text-brand-black/60">
          New admin logins can&apos;t be created from this dashboard — Supabase requires
          the project owner to create the login first. To add someone:
        </p>
        <ol className="mt-3 flex flex-col gap-2 text-sm text-brand-black/70">
          <li>1. In the Supabase dashboard, go to Authentication → Users → Add User and create their email/password login.</li>
          <li>2. In the Table Editor, open the <code className="rounded bg-brand-cream px-1.5 py-0.5">profiles</code> table and add a row with their new user ID and <code className="rounded bg-brand-cream px-1.5 py-0.5">role = admin</code>.</li>
          <li>3. Share their login with them — they can sign in here right away.</li>
        </ol>
      </section>
    </div>
  );
}
