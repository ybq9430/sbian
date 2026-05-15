"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { errorMessage, type AnalyticsData } from "@/types/api";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") {
      fetch("/api/analytics")
        .then(r => { if (!r.ok) throw new Error(`Request failed: ${r.status}`); return r.json(); })
        .then(setData)
        .catch(err => setError(errorMessage(err)));
    }
  }, [status, router]);

  if (error) return <div className="min-h-screen bg-gray-50 dark:bg-gray-900"><Navbar /><div className="text-red-500 dark:text-red-400 p-4 text-center bg-red-50 dark:bg-red-900/30 rounded-lg mb-4 max-w-7xl mx-auto mt-8">{error}</div></div>;
  if (!data) return <div className="min-h-screen bg-gray-50 dark:bg-gray-900"><Navbar /><div className="max-w-7xl mx-auto p-8">Loading...</div></div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1 dark:text-gray-400">Welcome back, {session?.user?.name}</p>
          </div>
          <Link href="/products/new" className="btn-primary">New product</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="stat">
            <span className="stat-label">My Products</span>
            <span className="stat-value">{data.myProducts}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Total Sales</span>
            <span className="stat-value">{formatNumber(data.totalSales || 0)}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Revenue</span>
            <span className="stat-value">{formatCurrency(data.totalRevenue || 0)}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Wallet Balance</span>
            <span className="stat-value text-green-600">{formatCurrency(data.walletBalance || 0)}</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="card">
            <h3 className="font-semibold mb-4">Quick actions</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { href: "/products/new", label: "Create product", icon: "+" },
                { href: "/products", label: "Manage products", icon: "📦" },
                { href: "/orders", label: "View orders", icon: "📋" },
                { href: "/analytics", label: "Analytics", icon: "📊" },
              ].map((a, i) => (
                <Link key={i} href={a.href} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-brand-300 hover:bg-brand-50 transition-colors dark:border-gray-700 dark:hover:bg-gray-700">
                  <span className="text-lg">{a.icon}</span>
                  <span className="text-sm font-medium">{a.label}</span>
                </Link>
              ))}
            </div>
          </div>
          <div className="card">
            <h3 className="font-semibold mb-4">Getting started</h3>
            <div className="space-y-3">
              {[
                { step: 1, text: "Create your first product", done: (data.myProducts ?? 0) > 0 },
                { step: 2, text: "Set up your payment method", done: !!session },
                { step: 3, text: "Share your product link", done: (data.myProducts ?? 0) > 0 },
                { step: 4, text: "Make your first sale", done: (data.totalSales ?? 0) > 0 },
              ].map((s) => (
                <div key={s.step} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${s.done ? "bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-300" : "bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500"}`}>
                    {s.done ? "✓" : s.step}
                  </div>
                  <span className={`text-sm ${s.done ? "text-gray-500 line-through dark:text-gray-400" : "text-gray-700 dark:text-gray-300"}`}>{s.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
