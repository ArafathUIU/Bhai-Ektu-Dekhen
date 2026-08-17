"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email, password);
      router.push("/my-reports");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="gradient-border animate-fade-up w-full max-w-sm rounded-2xl p-8 shadow-soft">
          <div className="text-center">
            <span className="animate-ring inline-flex rounded-2xl">
              <Logo size={52} />
            </span>
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
              <span className="text-gradient-animated">Welcome back</span>
            </h1>
            <p className="mt-1 text-sm text-slate-500">Sign in to report and track issues</p>
          </div>
          {error && (
            <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
          )}
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              Email
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input mt-1.5"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Password
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input mt-1.5"
              />
            </label>
            <button type="submit" disabled={busy} className="btn-primary btn-shine w-full">
              {busy ? "Logging in..." : "Login"}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-slate-500">
            No account?{" "}
            <Link href="/register" className="font-semibold text-teal-600 hover:underline">
              Register
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}