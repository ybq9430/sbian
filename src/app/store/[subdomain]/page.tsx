"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

export default function PublicStorePage() {
  const { subdomain } = useParams();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/storefront?subdomain=${subdomain}`).then(r => r.json()).then(setData);
  }, [subdomain]);

  if (!data) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  if (data.error) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-center"><h1 className="text-2xl font-bold mb-2">Store not found</h1><Link href="/" className="text-brand-600">Go home</Link></div></div>;

  const theme = data.theme || "default";
  const themeMap: Record<string, string> = {
    default: "from-brand-600 to-blue-600",
    dark: "from-gray-800 to-gray-900",
    gradient: "from-orange-500 to-pink-500",
    forest: "from-emerald-600 to-teal-700",
    ocean: "from-cyan-500 to-blue-600",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className={`bg-gradient-to-r ${themeMap[theme] || themeMap.default} text-white py-16`}>
        <div className="max-w-5xl mx-auto px-4 text-center">
          {data.logoUrl && <img src={data.logoUrl} alt={data.title} className="w-20 h-20 rounded-full mx-auto mb-4 object-cover" />}
          <h1 className="text-3xl font-bold mb-2">{data.title}</h1>
          {data.description && <p className="text-white/80 max-w-lg mx-auto">{data.description}</p>}
          <p className="text-white/50 text-sm mt-4">@{subdomain} · {data.products?.length || 0} products</p>
        </div>
      </header>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.products?.map((p: any) => (
            <Link key={p.id} href={`/products/${p.id}`} className="card hover:shadow-md transition-shadow">
              <div className="aspect-video bg-gradient-to-br from-brand-100 to-blue-100 rounded-lg mb-4 flex items-center justify-center text-4xl">📦</div>
              <h3 className="font-semibold">{p.title}</h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{p.description}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-lg font-bold text-brand-700">{formatCurrency(p.price)}</span>
                <span className="text-xs text-gray-400">{p.salesCount} sold</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
