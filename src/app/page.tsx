"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import Logo from "@/components/Logo";
import Icon from "@/components/icons";

export default function LoginPage() {
  const router = useRouter();
  const { session, profile, loading, isAdmin, signOut } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && session && isAdmin) {
      router.replace("/dashboard");
    }
  }, [loading, session, isAdmin, router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setError(
          signInError.message.toLowerCase().includes("invalid login credentials")
            ? "Incorrect email or password."
            : signInError.message
        );
      }
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || (session && isAdmin)) {
    return <div className="flex min-h-screen items-center justify-center bg-brand-cream" />;
  }

  if (session && profile && !isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-brand-cream px-6 text-center">
        <Icon name="alertTriangle" className="h-10 w-10 text-red-500" />
        <h1 className="font-heading text-2xl text-brand-black">Access Denied</h1>
        <p className="max-w-sm text-sm text-brand-black/60">
          This account isn&apos;t set up as an admin for Zuldal Beauty &amp;
          Wellness. Contact the store owner if you believe this is a mistake.
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
    <div className="flex min-h-screen items-center justify-center bg-brand-cream px-6">
      <div className="w-full max-w-sm rounded-2xl border border-brand-black/10 bg-brand-white p-8 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <Logo variant="compact" />
          <h1 className="mt-5 font-heading text-2xl text-brand-black">
            Admin Sign In
          </h1>
          <p className="mt-1 text-sm text-brand-black/50">
            Order confirmation &amp; store management
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-accent text-xs font-medium text-brand-black/70">
              Email Address
            </span>
            <input
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@zuldal.com"
              className="rounded-lg border border-brand-black/15 bg-brand-cream/40 px-3.5 py-2.5 text-sm text-brand-black placeholder:text-brand-black/30 focus:border-brand-gold focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-accent text-xs font-medium text-brand-black/70">
              Password
            </span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="rounded-lg border border-brand-black/15 bg-brand-cream/40 px-3.5 py-2.5 text-sm text-brand-black placeholder:text-brand-black/30 focus:border-brand-gold focus:outline-none"
            />
          </label>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-brand-brown px-6 py-3 font-accent text-sm font-semibold text-brand-white hover:bg-brand-gold disabled:opacity-60"
          >
            {submitting ? "Signing In..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
