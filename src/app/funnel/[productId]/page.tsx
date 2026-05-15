"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { errorMessage, type FunnelData, ProductData } from "@/types/api";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("@/components/Chart"), { ssr: false });

export default function ConversionFunnelPage() {
  const { productId } = useParams();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<FunnelData | null>(null);
  const [product, setProduct] = useState<ProductData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") {
      fetch(`/api/analytics/conversion?productId=${productId}`)
        .then(r => { if (!r.ok) throw new Error(`Request failed: ${r.status}`); return r.json(); })
        .then(setData)
        .catch(err => setError(errorMessage(err)));
      fetch(`/api/products/${productId}`)
        .then(r => { if (!r.ok) throw new Error(`Request failed: ${r.status}`); return r.json(); })
        .then(setProduct)
        .catch(err => setError(errorMessage(err)));
    }
  }, [productId, status, router]);

  if (error) return <div className="min-h-screen bg-gray-50 dark:bg-gray-900"><Navbar /><div className="text-red-500 dark:text-red-400 p-4 text-center bg-red-50 dark:bg-red-900/30 rounded-lg mb-4 max-w-5xl mx-auto mt-8">{error}</div></div>;
  if (!data || !product) return <div className="min-h-screen bg-gray-50 dark:bg-gray-900"><Navbar /><div className="max-w-5xl mx-auto p-8">Loading...</div></div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-2 dark:text-gray-100">Conversion funnel: {product.title}</h1>
        <p className="text-sm text-gray-500 mb-8 dark:text-gray-400">Track how visitors convert into buyers</p>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="stat"><span className="stat-label">Total views</span><span className="stat-value">{data.totalViews}</span></div>
          <div className="stat"><span className="stat-label">Conversions</span><span className="stat-value">{data.totalConversions}</span></div>
          <div className="stat"><span className="stat-label">Conversion rate</span><span className="stat-value text-green-600">{data.conversionRate}</span></div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="card">
            <h3 className="font-semibold mb-6">Sales funnel</h3>
            <div className="space-y-4">
              {data.funnel.map((f: { stage: string; count: number; pct: number }, i: number) => (
                <div key={i}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium">{f.stage}</span>
                    <span className="text-gray-500 dark:text-gray-400">{f.count} ({f.pct}%)</span>
                  </div>
                  <div className="h-8 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                    <div className={`h-full rounded-lg transition-all flex items-center pl-3 text-xs text-white font-medium ${
                      i === 0 ? "bg-blue-500" : i === 1 ? "bg-brand-500" : i === 2 ? "bg-orange-500" : "bg-green-500"
                    }`} style={{ width: `${Math.max(2, f.pct)}%` }}>
                      {f.pct > 8 && f.stage}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold mb-4">Traffic sources</h3>
            {Object.keys(data.sources).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(data.sources).map(([source, count]: [string, number]) => (
                  <div key={source} className="flex items-center gap-3">
                    <span className="text-sm capitalize w-20 truncate">{source}</span>
                    <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden dark:bg-gray-700">
                      <div className="h-full bg-brand-500 rounded-full" style={{ width: `${Math.round((count / data.totalViews) * 100)}%` }} />
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400 w-12 text-right">{count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 dark:text-gray-500">No traffic data yet. Share your product to start tracking.</p>
            )}
          </div>
        </div>

        <div className="card mt-8">
          <h3 className="font-semibold mb-4">Optimization tips</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: "📝", title: "Optimize description", desc: "Products with detailed descriptions convert 3x better. Use the AI Studio to generate optimized copy." },
              { icon: "🏷️", title: "Add tags", desc: "Products with 5+ tags get 2x more visibility in search results and recommendations." },
              { icon: "💎", title: "Try a flash deal", desc: "Flash deals typically increase conversion rate by 40-60% during the deal period." },
              { icon: "📊", title: "Boost visibility", desc: `Only ¥29 to feature your product for 7 days. Boosted products get 5x more views.` },
            ].map((tip, i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-lg flex gap-3 dark:bg-gray-700">
                <span className="text-2xl shrink-0">{tip.icon}</span>
                <div><h4 className="text-sm font-semibold mb-1">{tip.title}</h4><p className="text-xs text-gray-500 dark:text-gray-400">{tip.desc}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
