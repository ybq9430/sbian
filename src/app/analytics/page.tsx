"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import { formatCurrency, formatNumber } from "@/lib/utils";

const Chart = dynamic(() => import("@/components/Chart"), { ssr: false });

export default function AnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") {
      fetch("/api/analytics").then(r => r.json()).then(setData);
    }
  }, [status, router]);

  if (!data) return <div className="min-h-screen bg-gray-50"><Navbar /><div className="max-w-7xl mx-auto p-8">Loading...</div></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">Analytics</h1>

        {(session?.user as any)?.role === "admin" ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="stat"><span className="stat-label">Total Users</span><span className="stat-value">{formatNumber(data.totalUsers)}</span></div>
              <div className="stat"><span className="stat-label">Total Products</span><span className="stat-value">{formatNumber(data.totalProducts)}</span></div>
              <div className="stat"><span className="stat-label">Total Orders</span><span className="stat-value">{formatNumber(data.totalOrders)}</span></div>
              <div className="stat"><span className="stat-label">Total Revenue</span><span className="stat-value text-green-600">{formatCurrency(data.totalRevenue)}</span></div>
            </div>
            <div className="card mb-8">
              <h3 className="font-semibold mb-4">Revenue (last 30 days)</h3>
              <Chart data={data.monthlyOrders || []} />
            </div>
            <div className="card">
              <h3 className="font-semibold mb-4">Recent orders</h3>
              <table className="w-full text-sm">
                <thead><tr className="text-left text-gray-500 border-b"><th className="pb-2">User</th><th className="pb-2">Amount</th><th className="pb-2">Date</th><th className="pb-2">Status</th></tr></thead>
                <tbody>
                  {data.recentOrders?.map((o: any) => (
                    <tr key={o.id} className="border-b border-gray-50">
                      <td className="py-2">{o.buyer?.name}</td>
                      <td className="py-2">{formatCurrency(o.total)}</td>
                      <td className="py-2 text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td className="py-2"><span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{o.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="stat"><span className="stat-label">My Products</span><span className="stat-value">{data.myProducts}</span></div>
            <div className="stat"><span className="stat-label">Total Sales</span><span className="stat-value">{formatNumber(data.totalSales)}</span></div>
            <div className="stat"><span className="stat-label">Revenue</span><span className="stat-value text-green-600">{formatCurrency(data.totalRevenue)}</span></div>
            <div className="stat"><span className="stat-label">Wallet Balance</span><span className="stat-value">{formatCurrency(data.walletBalance)}</span></div>
          </div>
        )}
      </div>
    </div>
  );
}
