"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { formatCurrency } from "@/lib/utils";

export default function ABTestsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tests, setTests] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ productId: "", name: "", traffic: 0.5, variants: [{ name: "Original", title: "", description: "", price: 0 }, { name: "Variant B", title: "", description: "", price: 0 }] });
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") {
      fetch("/api/ab-tests").then(r => r.json()).then(setTests);
      fetch("/api/products").then(r => r.json()).then(d => setProducts(d.products.filter((p: any) => p.sellerId === (session?.user as any)?.id)));
    }
  }, [status, router, session]);

  async function createTest(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/ab-tests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, productId: form.productId || products[0]?.id }) });
    if (res.ok) { const t = await res.json(); setTests([t, ...tests]); setShowCreate(false); setMessage("Test created! Start it to begin collecting data."); }
    setTimeout(() => setMessage(""), 3000);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div><h1 className="text-2xl font-bold">A/B Tests</h1><p className="text-sm text-gray-500">Test different titles, descriptions, and prices to optimize conversions.</p></div>
          <button onClick={() => setShowCreate(!showCreate)} className="btn-primary">New test</button>
        </div>

        {message && <div className="bg-brand-50 text-brand-700 text-sm p-3 rounded-lg mb-4">{message}</div>}

        {showCreate && (
          <form onSubmit={createTest} className="card mb-8 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium mb-1">Product</label>
                <select className="input" value={form.productId} onChange={e => setForm({ ...form, productId: e.target.value })} required>
                  <option value="">Select...</option>
                  {products.map((p: any) => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>
              <div><label className="block text-sm font-medium mb-1">Test name</label><input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Title optimization" required /></div>
            </div>
            <div><label className="block text-sm font-medium mb-1">Traffic split (%)</label><input type="range" min="10" max="90" value={form.traffic * 100} onChange={e => setForm({ ...form, traffic: parseInt(e.target.value) / 100 })} className="w-full" /><p className="text-xs text-gray-400">{Math.round(form.traffic * 100)}% see variant · {Math.round((1 - form.traffic) * 100)}% see original</p></div>
            <div className="grid grid-cols-2 gap-4">
              {form.variants.map((v, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-sm mb-3">{v.name}</h4>
                  <div className="space-y-2">
                    <input className="input text-xs" placeholder="Title" value={v.title} onChange={e => { const nv = [...form.variants]; nv[i].title = e.target.value; setForm({ ...form, variants: nv }); }} />
                    <textarea className="input text-xs min-h-[60px]" placeholder="Description" value={v.description} onChange={e => { const nv = [...form.variants]; nv[i].description = e.target.value; setForm({ ...form, variants: nv }); }} />
                    <input className="input text-xs" type="number" placeholder="Price" value={v.price || ""} onChange={e => { const nv = [...form.variants]; nv[i].price = parseFloat(e.target.value) || 0; setForm({ ...form, variants: nv }); }} />
                  </div>
                </div>
              ))}
            </div>
            <button type="submit" className="btn-primary w-full">Create test</button>
          </form>
        )}

        <div className="space-y-4">
          {tests.map(t => (
            <div key={t.id} className="card">
              <div className="flex items-center justify-between mb-4">
                <div><h3 className="font-semibold">{t.name}</h3><p className="text-xs text-gray-500">{t.product?.title} · Traffic: {Math.round(t.traffic * 100)}%</p></div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${t.status === "active" ? "bg-green-100 text-green-700" : t.status === "draft" ? "bg-gray-100 text-gray-600" : "bg-blue-100 text-blue-700"}`}>{t.status}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {t.variants.map((v: any) => (
                  <div key={v.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2"><span className="text-sm font-medium">{v.name}</span><span className="text-xs text-gray-400">{v.impressions} views</span></div>
                    <p className="text-xs text-gray-600 truncate">{v.title || t.product?.title}</p>
                    <div className="flex items-center justify-between mt-2"><span className="text-sm font-bold">{v.conversions} conv.</span>
                      <span className="text-xs text-green-600">{v.impressions > 0 ? ((v.conversions / v.impressions) * 100).toFixed(1) + "%" : "0%"}</span></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {tests.length === 0 && !showCreate && <div className="card text-center py-12"><p className="text-gray-400">No A/B tests yet. Create one to optimize your product pages.</p></div>}
        </div>
      </div>
    </div>
  );
}
