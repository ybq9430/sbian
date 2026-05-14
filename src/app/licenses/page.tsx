"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { formatDate } from "@/lib/utils";

export default function LicensesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [licenses, setLicenses] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [genCount, setGenCount] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") {
      fetch("/api/products").then(r => r.json()).then(d => {
        const myProducts = d.products.filter((p: any) => p.sellerId === (session?.user as any)?.id);
        setProducts(myProducts);
        if (myProducts.length > 0) setSelectedProduct(myProducts[0].id);
      });
    }
  }, [status, router, session]);

  useEffect(() => {
    if (selectedProduct) fetch(`/api/licenses?productId=${selectedProduct}`).then(r => r.json()).then(setLicenses);
  }, [selectedProduct]);

  async function generateKeys() {
    setGenerating(true);
    const res = await fetch("/api/licenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: selectedProduct, count: genCount }),
    });
    const data = await res.json();
    setMessage(`Generated ${data.generated} license keys`);
    fetch(`/api/licenses?productId=${selectedProduct}`).then(r => r.json()).then(setLicenses);
    setGenerating(false);
    setTimeout(() => setMessage(""), 3000);
  }

  const available = licenses.filter(l => l.status === "available").length;
  const issued = licenses.filter(l => l.status === "issued").length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">License key manager</h1>

        {message && <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg mb-4">{message}</div>}

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="stat"><span className="stat-label">Total keys</span><span className="stat-value">{licenses.length}</span></div>
          <div className="stat"><span className="stat-label">Available</span><span className="stat-value text-green-600">{available}</span></div>
          <div className="stat"><span className="stat-label">Issued</span><span className="stat-value text-brand-700">{issued}</span></div>
        </div>

        <div className="card mb-8">
          <h2 className="font-semibold mb-4">Generate license keys</h2>
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Product</label>
              <select className="input" value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}>
                {products.map((p: any) => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Count</label>
              <input type="number" className="input w-24" min={1} max={100} value={genCount} onChange={e => setGenCount(parseInt(e.target.value) || 1)} />
            </div>
            <button onClick={generateKeys} disabled={generating || products.length === 0} className="btn-primary">
              {generating ? "Generating..." : "Generate"}
            </button>
          </div>
        </div>

        <div className="card overflow-x-auto">
          <h2 className="font-semibold mb-4">All license keys</h2>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-gray-500 border-b"><th className="pb-2">Key</th><th className="pb-2">Product</th><th className="pb-2">Status</th><th className="pb-2">Issued</th></tr></thead>
            <tbody>
              {licenses.map(l => (
                <tr key={l.id} className="border-b border-gray-50">
                  <td className="py-2 font-mono text-xs">{l.key}</td>
                  <td className="py-2">{l.product?.title}</td>
                  <td className="py-2"><span className={`text-xs px-2 py-0.5 rounded-full ${l.status === "available" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{l.status}</span></td>
                  <td className="py-2 text-gray-500">{l.issuedAt ? formatDate(l.issuedAt) : "-"}</td>
                </tr>
              ))}
              {licenses.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-gray-400">No license keys yet. Generate some above.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
