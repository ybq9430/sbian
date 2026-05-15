"use client";
import { useSession } from "next-auth/react";
import { useAuth } from "@/lib/use-auth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { formatCurrency } from "@/lib/utils";
import { errorMessage, type ProductData } from "@/types/api";

export default function MyProductsPage() {
  const { data: session, status } = useSession();
  const { user } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<ProductData[]>([]);
  const [boosting, setBoosting] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") {
      fetch("/api/products")
        .then(r => { if (!r.ok) throw new Error(`Request failed: ${r.status}`); return r.json(); })
        .then(d =>
          setProducts((d.products as ProductData[]).filter(p => p.sellerId === user?.id))
        )
        .catch(err => setError(errorMessage(err)));
    }
  }, [status, router, session]);

  async function handleBoost(productId: string) {
    setBoosting(productId);
    try {
      const res = await fetch("/api/products/boost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = await res.json();
      if (res.ok) setMessage(`Boosted! ${data.message}`);
      else setMessage(`Error: ${data.error}`);
    } catch (err: unknown) {
      setMessage(`Error: ${errorMessage(err)}`);
    }
    setBoosting(null);
    setTimeout(() => setMessage(""), 3000);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold dark:text-gray-100">My products</h1>
            <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">Manage and promote your digital products</p>
          </div>
          <Link href="/products/new" className="btn-primary">New product</Link>
        </div>

        {message && <div className="bg-brand-50 text-brand-700 text-sm p-3 rounded-lg mb-4 dark:bg-brand-900/30 dark:text-brand-300">{message}</div>}
        {error && <div className="text-red-500 dark:text-red-400 p-4 text-center bg-red-50 dark:bg-red-900/30 rounded-lg mb-4">{error}</div>}

        {products.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-400 dark:text-gray-500 mb-4">No products yet</p>
            <Link href="/products/new" className="btn-primary">Create your first product</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {products.map(p => (
              <div key={p.id} className="card flex items-center gap-6">
                <div className="w-16 h-16 bg-gradient-to-br from-brand-100 to-blue-100 rounded-lg flex items-center justify-center text-2xl shrink-0">📦</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold truncate">{p.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${p.status === "published" ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300" : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"}`}>{p.status}</span>
                  </div>
                  <p className="text-sm text-gray-500 truncate mt-0.5 dark:text-gray-400">{p.category}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-brand-700">{formatCurrency(p.price)}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{p.salesCount} sold · {formatCurrency(p.revenue)} revenue</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Link href={`/products/${p.id}`} className="btn-secondary text-xs !px-3 !py-1.5">View</Link>
                  <button onClick={() => handleBoost(p.id)} disabled={boosting === p.id} className="btn-primary text-xs !px-3 !py-1.5">
                    {boosting === p.id ? "..." : "Boost ¥29"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
