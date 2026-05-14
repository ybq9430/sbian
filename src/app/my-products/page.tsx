"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { formatCurrency } from "@/lib/utils";

export default function MyProductsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [boosting, setBoosting] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") {
      fetch("/api/products").then(r => r.json()).then(d =>
        setProducts(d.products.filter((p: any) => p.sellerId === (session?.user as any)?.id))
      );
    }
  }, [status, router, session]);

  async function handleBoost(productId: string) {
    setBoosting(productId);
    const res = await fetch("/api/products/boost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
    const data = await res.json();
    if (res.ok) setMessage(`Boosted! ${data.message}`);
    else setMessage(`Error: ${data.error}`);
    setBoosting(null);
    setTimeout(() => setMessage(""), 3000);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">My products</h1>
            <p className="text-sm text-gray-500 mt-1">Manage and promote your digital products</p>
          </div>
          <Link href="/products/new" className="btn-primary">New product</Link>
        </div>

        {message && <div className="bg-brand-50 text-brand-700 text-sm p-3 rounded-lg mb-4">{message}</div>}

        {products.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-400 mb-4">No products yet</p>
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
                    <span className={`text-xs px-2 py-0.5 rounded-full ${p.status === "published" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{p.status}</span>
                  </div>
                  <p className="text-sm text-gray-500 truncate mt-0.5">{p.category}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-brand-700">{formatCurrency(p.price)}</p>
                  <p className="text-xs text-gray-400">{p.salesCount} sold · {formatCurrency(p.revenue)} revenue</p>
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
