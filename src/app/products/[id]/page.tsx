"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import Recommendations from "@/components/Recommendations";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function ProductDetailPage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    fetch(`/api/products/${id}`).then(r => r.json()).then(setProduct);
    fetch("/api/analytics/conversion", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: id, event: "view", source: "direct" }) });
  }, [id]);

  async function handleBuy() {
    if (!session) { router.push("/login"); return; }
    setBuying(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: [{ productId: product.id, price: product.price, quantity: 1 }] }),
    });
    if (res.ok) { alert("Purchase successful! Check your orders for the download link."); router.push("/orders"); }
    else { alert("Purchase failed. Please try again."); }
    setBuying(false);
  }

  if (!product) return <div className="min-h-screen bg-gray-50"><Navbar /><div className="max-w-7xl mx-auto p-8">Loading...</div></div>;

  const isOwner = session && (session.user as any).id === product.sellerId;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <div className="aspect-square bg-gradient-to-br from-brand-100 to-blue-100 rounded-2xl flex items-center justify-center text-8xl">
              {product.coverImage ? <img src={product.coverImage} alt={product.title} className="w-full h-full object-cover rounded-2xl" /> : "📦"}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">{product.category}</span>
              <span className="text-xs text-gray-400">{product.salesCount} sales</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
            <p className="text-sm text-gray-500 mb-1">by {product.seller?.name}</p>
            {product.rating > 0 && <div className="text-yellow-500 text-sm mb-4">{'★'.repeat(Math.round(product.rating))} {product.rating.toFixed(1)}</div>}
            <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>
            <div className="text-3xl font-bold text-brand-700 mb-6">{formatCurrency(product.price)}</div>
            {isOwner ? (
              <button disabled className="btn-secondary w-full">This is your product</button>
            ) : (
              <button onClick={handleBuy} disabled={buying} className="btn-primary w-full text-lg !py-3 rounded-xl">
                {buying ? "Processing..." : "Buy now"}
              </button>
            )}
            <p className="text-xs text-gray-400 text-center mt-3">30-day money-back guarantee</p>
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Reviews ({product.reviews?.length || 0})</h2>
            <Link href={`/community/${product.id}`} className="text-sm text-brand-600 hover:underline">View discussions</Link>
          </div>
          {product.reviews?.length > 0 ? (
            <div className="space-y-4">
              {product.reviews.map((r: any) => (
                <div key={r.id} className="card">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center text-sm font-medium">
                      {r.user?.name?.[0] || "U"}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{r.user?.name}</p>
                      <p className="text-xs text-gray-400">{formatDate(r.createdAt)}</p>
                    </div>
                    <div className="ml-auto text-yellow-500 text-sm">{'★'.repeat(r.rating)}</div>
                  </div>
                  {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
                </div>
              ))}
            </div>
          ) : <p className="text-gray-400 text-sm">No reviews yet.</p>}
        </div>
        <Recommendations productId={product.id} />
      </div>
    </div>
  );
}
