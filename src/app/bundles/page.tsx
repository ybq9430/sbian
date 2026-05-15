"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { formatCurrency } from "@/lib/utils";
import { errorMessage, type BundleData } from "@/types/api";

export default function BundlesPage() {
  const [bundles, setBundles] = useState<BundleData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/bundles")
      .then(r => { if (!r.ok) throw new Error(`Request failed: ${r.status}`); return r.json(); })
      .then(setBundles)
      .catch(err => setError(errorMessage(err)));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2 dark:text-gray-100">Product bundles</h1>
          <p className="text-gray-500 text-sm dark:text-gray-400">Curated collections at a special price. Save more by buying together.</p>
        </div>

        {error && <div className="text-red-500 dark:text-red-400 p-4 text-center bg-red-50 dark:bg-red-900/30 rounded-lg mb-4">{error}</div>}

        {bundles.length === 0 ? (
          <div className="card text-center py-16">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="font-semibold text-lg mb-2">No bundles yet</h3>
            <p className="text-sm text-gray-400 dark:text-gray-500">Check back soon for curated product bundles!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bundles.map((b: BundleData) => (
              <div key={b.id} className="card hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium dark:bg-green-900/50 dark:text-green-300">
                    Save {formatCurrency(b.savings || 0)}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">{b.items?.length || 0} products</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">{b.title}</h3>
                <p className="text-sm text-gray-500 mb-4 dark:text-gray-400">{b.description}</p>
                <div className="space-y-2 mb-4">
                  {b.items?.map((item: { product: { id: string; title: string; price: number } }, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <span className="text-gray-400 dark:text-gray-500">+</span>
                      <span className="flex-1 truncate">{item.product?.title}</span>
                      <span className="text-gray-400 text-xs dark:text-gray-500">{formatCurrency(item.product?.price)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between border-t pt-3 dark:border-gray-700">
                  <div>
                    <span className="text-xs text-gray-400 line-through block dark:text-gray-500">{formatCurrency(b.originalPrice || 0)}</span>
                    <span className="text-2xl font-bold text-green-600">{formatCurrency(b.price)}</span>
                  </div>
                  <button className="btn-primary">Buy bundle</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
