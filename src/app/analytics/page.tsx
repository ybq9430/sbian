"use client";
import { useSession } from "next-auth/react";
import { useAuth } from "@/lib/use-auth";
import { useEffect, useState } from "react";
import { errorMessage, type AnalyticsData, OrderData } from "@/types/api";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import { formatCurrency, formatNumber } from "@/lib/utils";

const Chart = dynamic(() => import("@/components/Chart"), { ssr: false });

export default function AnalyticsPage() {
  const { data: session, status } = useSession();
  const { isAdmin } = useAuth();
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
        <h1 className="text-2xl font-bold mb-8 dark:text-gray-100">Analytics</h1>

        {isAdmin ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="stat"><span className="stat-label">Total Users</span><span className="stat-value">{formatNumber(data.totalUsers ?? 0)}</span></div>
              <div className="stat"><span className="stat-label">Total Products</span><span className="stat-value">{formatNumber(data.totalProducts ?? 0)}</span></div>
              <div className="stat"><span className="stat-label">Total Orders</span><span className="stat-value">{formatNumber(data.totalOrders ?? 0)}</span></div>
              <div className="stat"><span className="stat-label">Total Revenue</span><span className="stat-value text-green-600">{formatCurrency(data.totalRevenue ?? 0)}</span></div>
            </div>
            <div className="card mb-8">
              <h3 className="font-semibold mb-4">Revenue (last 30 days)</h3>
              <Chart data={data.monthlyOrders || []} />
            </div>
            <div className="card">
              <h3 className="font-semibold mb-4">Recent orders</h3>
              <table className="w-full text-sm">
                <thead><tr className="text-left text-gray-500 border-b dark:text-gray-400 dark:border-gray-700"><th className="pb-2">User</th><th className="pb-2">Amount</th><th className="pb-2">Date</th><th className="pb-2">Status</th></tr></thead>
                <tbody>
                  {data.recentOrders?.map((o: OrderData & { buyer?: { name: string } }) => (
                    <tr key={o.id} className="border-b border-gray-50 dark:border-gray-800">
                      <td className="py-2">{o.buyer?.name}</td>
                      <td className="py-2">{formatCurrency(o.total)}</td>
                      <td className="py-2 text-gray-500 dark:text-gray-400">{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td className="py-2"><span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full dark:bg-green-900/50 dark:text-green-300">{o.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="stat"><span className="stat-label">My Products</span><span className="stat-value">{data.myProducts ?? 0}</span></div>
            <div className="stat"><span className="stat-label">Total Sales</span><span className="stat-value">{formatNumber(data.totalSales ?? 0)}</span></div>
            <div className="stat"><span className="stat-label">Revenue</span><span className="stat-value text-green-600">{formatCurrency(data.totalRevenue ?? 0)}</span></div>
            <div className="stat"><span className="stat-label">Wallet Balance</span><span className="stat-value">{formatCurrency(data.walletBalance ?? 0)}</span></div>
          </div>
        )}
      </div>
    </div>
  );
}
