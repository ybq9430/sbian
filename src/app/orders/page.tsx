"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { formatCurrency, formatDate } from "@/lib/utils";
import { errorMessage, type OrderData, OrderItemData } from "@/types/api";

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") {
      fetch("/api/orders")
        .then(r => { if (!r.ok) throw new Error(`Request failed: ${r.status}`); return r.json(); })
        .then(setOrders)
        .catch(err => setError(errorMessage(err)));
    }
  }, [status, router]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8 dark:text-gray-100">My orders</h1>
        {error && <div className="text-red-500 dark:text-red-400 p-4 text-center bg-red-50 dark:bg-red-900/30 rounded-lg mb-4">{error}</div>}
        {orders.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-400 dark:text-gray-500 mb-4">No orders yet</p>
            <button onClick={() => router.push("/products")} className="btn-primary">Browse products</button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="card">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full mr-2 dark:bg-gray-700 dark:text-gray-400">Order #{order.id.slice(-8)}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">{formatDate(order.createdAt)}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${order.status === "completed" ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300"}`}>
                    {order.status}
                  </span>
                </div>
                {order.items.map((item: OrderItemData) => (
                  <div key={item.id} className="flex items-center gap-4 py-2 border-t border-gray-100 dark:border-gray-800">
                    <div className="w-12 h-12 bg-gradient-to-br from-brand-100 to-blue-100 rounded-lg flex items-center justify-center text-xl">📦</div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.product?.title}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-sm">{formatCurrency(item.price)}</p>
                    {item.product && "fileUrl" in item.product && <a href={(item.product as { fileUrl: string }).fileUrl} className="btn-primary text-xs !px-2 !py-1">Download</a>}
                  </div>
                ))}
                <div className="border-t border-gray-100 dark:border-gray-800 pt-3 mt-2 text-right">
                  <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Total:</span>
                  <span className="font-bold">{formatCurrency(order.total)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
