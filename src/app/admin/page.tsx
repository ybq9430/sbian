"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { formatCurrency, formatDate } from "@/lib/utils";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("@/components/Chart"), { ssr: false });

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated" && (session.user as any).role !== "admin") router.push("/dashboard");
    if (status === "authenticated") {
      fetch("/api/admin").then(r => r.json()).then(setData);
    }
  }, [status, session, router]);

  if (!data) return <div className="min-h-screen bg-gray-50"><Navbar /><div className="max-w-7xl mx-auto p-8">Loading...</div></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Admin panel</h1>
            <p className="text-sm text-gray-500 mt-1">Manage users, products, and orders</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="stat"><span className="stat-label">Total users</span><span className="stat-value">{data.users.length}</span></div>
          <div className="stat"><span className="stat-label">Products</span><span className="stat-value">{data.products.length}</span></div>
          <div className="stat"><span className="stat-label">Orders</span><span className="stat-value">{data.orders.length}</span></div>
          <div className="stat"><span className="stat-label">Total revenue</span><span className="stat-value text-green-600">{formatCurrency(data.totalRevenue)}</span></div>
        </div>

        <div className="flex gap-2 mb-6">
          {["overview", "users", "products", "orders"].map(t => (
            <button key={t} onClick={() => setTab(t)} className={`btn text-sm capitalize ${tab === t ? "btn-primary" : "btn-secondary"}`}>{t}</button>
          ))}
        </div>

        {tab === "users" && (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-gray-500 border-b"><th className="pb-2">Name</th><th className="pb-2">Email</th><th className="pb-2">Role</th><th className="pb-2">Joined</th></tr></thead>
              <tbody>{data.users.map((u: any) => (
                <tr key={u.id} className="border-b border-gray-50"><td className="py-2 font-medium">{u.name}</td><td className="py-2">{u.email}</td><td className="py-2"><span className={`text-xs px-2 py-0.5 rounded-full ${u.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"}`}>{u.role}</span></td><td className="py-2 text-gray-500">{formatDate(u.createdAt)}</td></tr>
              ))}</tbody>
            </table>
          </div>
        )}

        {tab === "products" && (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-gray-500 border-b"><th className="pb-2">Title</th><th className="pb-2">Seller</th><th className="pb-2">Price</th><th className="pb-2">Sales</th><th className="pb-2">Revenue</th></tr></thead>
              <tbody>{data.products.map((p: any) => (
                <tr key={p.id} className="border-b border-gray-50"><td className="py-2 font-medium">{p.title}</td><td className="py-2">{p.seller?.name}</td><td className="py-2">{formatCurrency(p.price)}</td><td className="py-2">{p.salesCount}</td><td className="py-2 text-green-600">{formatCurrency(p.revenue)}</td></tr>
              ))}</tbody>
            </table>
          </div>
        )}

        {tab === "orders" && (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-gray-500 border-b"><th className="pb-2">Order ID</th><th className="pb-2">Buyer</th><th className="pb-2">Items</th><th className="pb-2">Total</th><th className="pb-2">Date</th></tr></thead>
              <tbody>{data.orders.map((o: any) => (
                <tr key={o.id} className="border-b border-gray-50"><td className="py-2 font-mono text-xs">{o.id.slice(-8)}</td><td className="py-2">{o.buyer?.name}</td><td className="py-2">{o.items?.map((i: any) => i.product?.title).join(", ")}</td><td className="py-2 font-semibold">{formatCurrency(o.total)}</td><td className="py-2 text-gray-500">{formatDate(o.createdAt)}</td></tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
