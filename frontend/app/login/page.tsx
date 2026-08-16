"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
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
      <main className="flex flex-1 items-center justify-center px-4">
        <form onSubmit={onSubmit} className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-6">
          <h1 className="text-xl font-semibold text-gray-900">Login</h1>
          {error && <p className="mt-3 rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}
          <label className="mt-4 block text-sm font-medium text-gray-700">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </label>
          <label className="mt-3 block text-sm font-medium text-gray-700">
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="mt-5 w-full rounded-md bg-gray-900 py-2 font-medium text-white hover:bg-gray-700 disabled:opacity-50"
          >
            {busy ? "Logging in..." : "Login"}
          </button>
          <p className="mt-3 text-sm text-gray-500">
            No account?{" "}
            <Link href="/register" className="text-blue-600 hover:underline">
              Register
            </Link>
          </p>
        </form>
      </main>
    </>
  );
}
