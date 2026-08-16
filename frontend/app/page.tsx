import Link from "next/link";
import { Navbar } from "@/components/Navbar";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <h1 className="text-4xl font-bold text-gray-900">Bhai Ektu Dekhen 👀</h1>
        <p className="mt-3 text-lg text-gray-600">
          আপনার এলাকার সমস্যা জানান। আমরা দেখব। সবাই মিলে ঠিক করব।
        </p>
        <p className="mt-1 text-sm text-gray-500">Report civic issues with photos and location.</p>
        <div className="mt-8 flex gap-4">
          <Link
            href="/report"
            className="rounded-lg bg-gray-900 px-6 py-3 font-medium text-white hover:bg-gray-700"
          >
            Report an Issue
          </Link>
          <Link
            href="/explore"
            className="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50"
          >
            🗺️ Explore Issues
          </Link>
        </div>
      </main>
    </>
  );
}
