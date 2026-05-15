"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import type { ProductData } from "@/types/api";

interface RecItem extends ProductData {
  reason?: string;
}

export default function Recommendations({ productId }: { productId?: string }) {
  const [items, setItems] = useState<RecItem[]>([]);

  useEffect(() => {
    const url = productId ? `/api/recommendations?productId=${productId}` : "/api/recommendations";
    fetch(url).then(r => r.json()).then(setItems);
  }, [productId]);

  if (items.length === 0) return null;

  return (
    <div className="mt-12">
      <h2 className="text-xl font-bold mb-6">{productId ? "You might also like" : "Recommended for you"}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {items.map((item) => (
          <Link key={item.id} href={`/products/${item.id}`} className="card hover:shadow-md transition-all group">
            <div className="aspect-square bg-gradient-to-br from-brand-50 to-blue-50 rounded-lg mb-3 flex items-center justify-center text-2xl">
              {item.coverImage ? <img src={item.coverImage} alt={item.title} className="w-full h-full object-cover rounded-lg" /> : "📦"}
            </div>
            <h4 className="text-xs font-semibold truncate group-hover:text-brand-600 transition-colors">{item.title}</h4>
            <p className="text-xs text-gray-400 mt-0.5">{item.seller?.name}</p>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-sm font-bold text-brand-700">{formatCurrency(item.price)}</span>
              <span className="text-[10px] text-gray-400">{item.salesCount} sold</span>
            </div>
            {item.reason && <span className="text-[10px] text-brand-500 bg-brand-50 px-1.5 py-0.5 rounded">{item.reason}</span>}
          </Link>
        ))}
      </div>
    </div>
  );
}
