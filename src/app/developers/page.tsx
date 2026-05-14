"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function DeveloperPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState("keys");
  const [keys, setKeys] = useState<any[]>([]);
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [newKey, setNewKey] = useState({ name: "", scopes: "read" });
  const [newWebhook, setNewWebhook] = useState({ url: "", events: "sale,refund" });
  const [showFullKey, setShowFullKey] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") {
      fetch("/api/api-keys").then(r => r.json()).then(setKeys);
      fetch("/api/webhooks").then(r => r.json()).then(setWebhooks);
    }
  }, [status, router]);

  async function createKey(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/api-keys", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newKey) });
    const data = await res.json();
    if (res.ok) { setKeys([...keys, data]); setShowFullKey({ ...showFullKey, [data.id]: true }); setNewKey({ name: "", scopes: "read" }); setMessage("API key created! Copy it now - you won't see it again."); }
    setTimeout(() => setMessage(""), 5000);
  }

  async function deleteKey(id: string) { await fetch("/api/api-keys", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) }); setKeys(keys.filter(k => k.id !== id)); }

  async function createWebhook(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/webhooks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newWebhook) });
    const data = await res.json();
    if (res.ok) { setWebhooks([...webhooks, data]); setNewWebhook({ url: "", events: "sale,refund" }); setMessage("Webhook created! Save your signing secret."); }
  }

  async function deleteWebhook(id: string) { await fetch("/api/webhooks", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) }); setWebhooks(webhooks.filter(w => w.id !== id)); }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-2">Developer platform</h1>
        <p className="text-sm text-gray-500 mb-8">API keys, webhooks, and integrations for your products.</p>

        {message && <div className="bg-brand-50 text-brand-700 text-sm p-3 rounded-lg mb-4">{message}</div>}

        <div className="flex gap-2 mb-8">
          {[{ id: "keys", label: "API keys" }, { id: "webhooks", label: "Webhooks" }, { id: "docs", label: "Documentation" }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`btn text-sm ${tab === t.id ? "btn-primary" : "btn-secondary"}`}>{t.label}</button>
          ))}
        </div>

        {tab === "keys" && (
          <div className="space-y-6">
            <form onSubmit={createKey} className="card flex items-end gap-4">
              <div className="flex-1"><label className="block text-sm font-medium mb-1">Key name</label><input className="input" value={newKey.name} onChange={e => setNewKey({ ...newKey, name: e.target.value })} placeholder="e.g. Production API" required /></div>
              <div><label className="block text-sm font-medium mb-1">Scopes</label>
                <select className="input" value={newKey.scopes} onChange={e => setNewKey({ ...newKey, scopes: e.target.value })}>
                  <option value="read">Read only</option>
                  <option value="read,write">Read & Write</option>
                  <option value="read,write,admin">Admin</option>
                </select>
              </div>
              <button type="submit" className="btn-primary">Generate key</button>
            </form>
            <div className="card overflow-x-auto">
              <table className="w-full text-sm"><thead><tr className="text-left text-gray-500 border-b"><th className="pb-2">Name</th><th className="pb-2">Key</th><th className="pb-2">Scopes</th><th className="pb-2">Created</th><th className="pb-2" /></tr></thead>
                <tbody>{keys.map(k => (
                  <tr key={k.id} className="border-b border-gray-50"><td className="py-2 font-medium">{k.name}</td><td className="py-2 font-mono text-xs">{showFullKey[k.id] ? k.fullKey || k.key : k.key}</td><td className="py-2 text-xs">{k.scopes}</td><td className="py-2 text-xs text-gray-500">{new Date(k.createdAt).toLocaleDateString()}</td><td className="py-2"><button onClick={() => deleteKey(k.id)} className="text-xs text-red-500 hover:underline">Revoke</button></td></tr>
                ))}</tbody></table>
              {keys.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No API keys yet.</p>}
            </div>
          </div>
        )}

        {tab === "webhooks" && (
          <div className="space-y-6">
            <form onSubmit={createWebhook} className="card flex items-end gap-4">
              <div className="flex-1"><label className="block text-sm font-medium mb-1">Endpoint URL</label><input className="input" value={newWebhook.url} onChange={e => setNewWebhook({ ...newWebhook, url: e.target.value })} placeholder="https://your-server.com/webhook" required /></div>
              <div><label className="block text-sm font-medium mb-1">Events</label><input className="input" value={newWebhook.events} onChange={e => setNewWebhook({ ...newWebhook, events: e.target.value })} /></div>
              <button type="submit" className="btn-primary">Add</button>
            </form>
            <div className="space-y-4">
              {webhooks.map(w => (
                <div key={w.id} className="card">
                  <div className="flex items-center justify-between mb-2"><span className="font-medium text-sm">{w.url}</span><span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{w.active ? "Active" : "Inactive"}</span></div>
                  <div className="text-xs text-gray-500 space-x-4"><span>Events: {w.events}</span><span>Secret: {w.secret?.slice(0, 12)}...</span><span>Deliveries: {w.deliveries?.length || 0}</span></div>
                  <div className="mt-2"><button onClick={() => deleteWebhook(w.id)} className="text-xs text-red-500 hover:underline">Remove</button></div>
                </div>
              ))}
              {webhooks.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No webhooks configured.</p>}
            </div>
          </div>
        )}

        {tab === "docs" && (
          <div className="card space-y-6">
            <h2 className="font-semibold text-lg">API Reference</h2>
            <div>
              <h3 className="font-semibold mb-2">Authentication</h3>
              <div className="bg-gray-900 text-green-400 text-xs p-4 rounded-lg font-mono">curl -H "Authorization: Bearer sk_your_api_key" https://shelf.io/api/products</div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { method: "GET", path: "/api/products", desc: "List all published products" },
                { method: "GET", path: "/api/products/:id", desc: "Get product details" },
                { method: "POST", path: "/api/orders", desc: "Create a new order" },
                { method: "GET", path: "/api/orders", desc: "List your orders" },
                { method: "GET", path: "/api/analytics", desc: "Get your analytics data" },
                { method: "POST", path: "/api/analytics/conversion", desc: "Track a conversion event" },
              ].map((ep, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-xs font-mono bg-gray-200 px-1.5 py-0.5 rounded mr-2">{ep.method}</span>
                  <span className="text-sm font-mono">{ep.path}</span>
                  <p className="text-xs text-gray-500 mt-1">{ep.desc}</p>
                </div>
              ))}
            </div>
            <div>
              <h3 className="font-semibold mb-2">Rate limits</h3>
              <p className="text-sm text-gray-500">Free: 100 req/min. Pro: 1000 req/min. Enterprise: custom.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
