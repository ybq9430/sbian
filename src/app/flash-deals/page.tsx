"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { formatCurrency } from "@/lib/utils";

function Countdown({ seconds }: { seconds: number }) {
  const [t, setT] = useState(seconds);
  useEffect(() => {
    if (t <= 0) return;
    const id = setInterval(() => setT(prev => Math.max(0, prev - 1)), 1000);
    return () => clearInterval(id);
  }, [t]);
  const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
  return <span className="font-mono font-bold text-red-500">{String(h).padStart(2, "0")}:{String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}</span>;
}

export default function FlashDealsPage() {
  const [deals, setDeals] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/flash-deals").then(r => r.json()).then(setDeals);
    const id = setInterval(() => fetch("/api/flash-deals").then(r => r.json()).then(setDeals), 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <h1 className="text-2xl font-bold">⚡ Flash deals</h1>
          <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full animate-pulse">LIVE</span>
        </div>
        <p className="text-gray-500 text-sm -mt-6 mb-8">Limited-time offers. Grab them before they're gone.</p>

        {deals.length === 0 ? (
          <div className="card text-center py-16">
            <div className="text-6xl mb-4">⚡</div>
            <h3 className="font-semibold text-lg mb-2">No active flash deals</h3>
            <p className="text-sm text-gray-400">Check back soon for new deals!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deals.map((d: any) => (
              <Link key={d.id} href={`/products/${d.productId}`} className="card hover:shadow-lg transition-all group relative overflow-hidden">
                <div className="absolute top-3 right-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
                  -{Math.round((1 - d.salePrice / d.product.price) * 100)}%
                </div>
                <div className="aspect-video bg-gradient-to-br from-brand-100 to-blue-100 rounded-lg mb-4 flex items-center justify-center text-4xl">📦</div>
                <h3 className="font-semibold group-hover:text-brand-600 transition-colors truncate">{d.product.title}</h3>
                <p className="text-xs text-gray-400 mt-1">by {d.product.seller?.name}</p>
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-2xl font-bold text-red-600">{formatCurrency(d.salePrice)}</span>
                  <span className="text-sm text-gray-400 line-through">{formatCurrency(d.product.price)}</span>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Sold: {d.soldCount}/{d.maxSales}</span>
                    <span className="text-gray-500"><Countdown seconds={d.timeLeft} /></span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-red-500 to-orange-400 rounded-full transition-all" style={{ width: `${d.progress}%` }} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
