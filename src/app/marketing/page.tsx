"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function MarketingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [subscribers, setSubscribers] = useState<any>({ subscribers: [], count: 0 });
  const [products, setProducts] = useState<any[]>([]);
  const [form, setForm] = useState({ subject: "", content: "", productId: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<null | { recipientCount: number }>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") {
      fetch("/api/email").then(r => r.json()).then(setSubscribers);
      fetch("/api/products").then(r => r.json()).then(d => setProducts(d.products.filter((p: any) => p.sellerId === (session?.user as any)?.id)));
    }
  }, [status, router, session]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    const res = await fetch("/api/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSent(data);
    setSending(false);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-2">Email marketing</h1>
        <p className="text-gray-500 text-sm mb-8">Send campaigns to your customers and grow your sales.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="stat"><span className="stat-label">Total subscribers</span><span className="stat-value">{subscribers.count}</span></div>
          <div className="stat"><span className="stat-label">Products</span><span className="stat-value">{products.length}</span></div>
          <div className="stat"><span className="stat-label">Avg. open rate</span><span className="stat-value">--</span></div>
        </div>

        <div className="card">
          <h2 className="font-semibold mb-4">Send campaign</h2>
          {sent ? (
            <div className="bg-green-50 text-green-700 p-4 rounded-lg">
              <p className="font-semibold">Campaign sent!</p>
              <p className="text-sm">Sent to {sent.recipientCount} recipients. {sent.recipientCount === 0 && "No subscribers yet. Share your products to build your list."}</p>
              <button onClick={() => setSent(null)} className="btn-secondary mt-3 text-sm">Send another</button>
            </div>
          ) : (
            <form onSubmit={handleSend} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Target product (optional)</label>
                <select className="input" value={form.productId} onChange={e => setForm({ ...form, productId: e.target.value })}>
                  <option value="">All customers</option>
                  {products.map((p: any) => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Subject</label>
                <input className="input" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required placeholder="Your email subject..." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Content</label>
                <textarea className="input min-h-[150px]" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} required placeholder="Write your email content..." />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">Emails will be sent to {subscribers.count} subscribers</p>
                <button type="submit" disabled={sending || subscribers.count === 0} className="btn-primary">
                  {sending ? "Sending..." : `Send to ${subscribers.count} subscribers`}
                </button>
              </div>
            </form>
          )}
        </div>

        {subscribers.subscribers.length > 0 && (
          <div className="card mt-6">
            <h2 className="font-semibold mb-4">Subscriber list</h2>
            <table className="w-full text-sm">
              <thead><tr className="text-left text-gray-500 border-b"><th className="pb-2">Name</th><th className="pb-2">Email</th></tr></thead>
              <tbody>
                {subscribers.subscribers.map((s: any) => (
                  <tr key={s.id} className="border-b border-gray-50"><td className="py-2 font-medium">{s.name}</td><td className="py-2 text-gray-500">{s.email}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
