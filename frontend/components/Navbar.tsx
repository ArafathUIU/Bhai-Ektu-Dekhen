"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold text-gray-900">
          Bhai Ektu Dekhen 👀
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/explore" className="text-gray-600 hover:text-gray-900">
            Explore
          </Link>
          {user ? (
            <>
              <Link href="/my-reports" className="text-gray-600 hover:text-gray-900">
                My Reports
              </Link>
              {user.role?.slug === "admin" && (
                <>
                  <Link href="/admin" className="text-gray-600 hover:text-gray-900">
                    Admin
                  </Link>
                  <Link href="/analytics" className="text-gray-600 hover:text-gray-900">
                    Analytics
                  </Link>
                </>
              )}
              <span className="text-gray-500">{user.name}</span>
              <button onClick={() => logout()} className="text-red-600 hover:text-red-800">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-gray-600 hover:text-gray-900">
                Login
              </Link>
              <Link href="/register" className="rounded-md bg-gray-900 px-3 py-1.5 text-white hover:bg-gray-700">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
