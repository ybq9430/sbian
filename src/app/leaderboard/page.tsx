"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { errorMessage, type ProductData } from "@/types/api";
import { formatCurrency, formatNumber } from "@/lib/utils";

interface SellerRow {
  id: string;
  name: string;
  products: number;
  sales: number;
  revenue: number;
  rating: number;
  ratingCount: number;
  rank?: number;
  avgRating?: number;
}

export default function LeaderboardPage() {
  const [sellers, setSellers] = useState<SellerRow[]>([]);
  const [period, setPeriod] = useState("all");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/products")
      .then(r => { if (!r.ok) throw new Error(`Request failed: ${r.status}`); return r.json(); })
      .then(d => {
        const sellerMap: Record<string, SellerRow> = {};
        (d.products as ProductData[]).forEach((p) => {
          if (!sellerMap[p.sellerId]) sellerMap[p.sellerId] = { id: p.sellerId, name: p.seller?.name || "Unknown", products: 0, sales: 0, revenue: 0, rating: 0, ratingCount: 0 };
          sellerMap[p.sellerId].products += 1;
          sellerMap[p.sellerId].sales += p.salesCount;
          sellerMap[p.sellerId].revenue += p.revenue;
          sellerMap[p.sellerId].rating += p.rating;
          sellerMap[p.sellerId].ratingCount += 1;
        });
        const sorted = Object.values(sellerMap).sort((a, b) => b.revenue - a.revenue);
        setSellers(sorted.map((s, i) => ({ ...s, rank: i + 1, avgRating: s.ratingCount > 0 ? s.rating / s.ratingCount : 0 })));
      })
      .catch(err => setError(errorMessage(err)));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold dark:text-gray-100">Leaderboard</h1>
            <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">Top sellers on the platform</p>
          </div>
          <div className="flex gap-2">
            {["all", "month", "week"].map(p => (
              <button key={p} onClick={() => setPeriod(p)} className={`btn text-sm capitalize ${period === p ? "btn-primary" : "btn-secondary"}`}>{p}</button>
            ))}
          </div>
        </div>

        {error && <div className="text-red-500 dark:text-red-400 p-4 text-center bg-red-50 dark:bg-red-900/30 rounded-lg mb-4">{error}</div>}

        <div className="space-y-3">
          {sellers.map((s) => (
            <Link key={s.id} href={`/creator/${s.id}`} className="card flex items-center gap-6 hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shrink-0 ${
                (s.rank || 99) === 1 ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300" :
                (s.rank || 99) === 2 ? "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400" :
                (s.rank || 99) === 3 ? "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300" :
                "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
              }`}>
                {(s.rank || 99) <= 3 ? ["🥇", "🥈", "🥉"][(s.rank || 1) - 1] : `#${s.rank}`}
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-600 to-blue-600 text-white flex items-center justify-center font-bold text-lg shrink-0">
                {s.name?.[0] || "?"}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{s.name}</h3>
                <p className="text-xs text-gray-400 dark:text-gray-500">{s.products} products · {s.sales} total sales · {(s.avgRating ?? 0).toFixed(1)} ★</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-brand-700 text-lg">{formatCurrency(s.revenue)}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">total revenue</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
