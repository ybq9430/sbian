"use client";
import { useSession } from "next-auth/react";
import { useAuth } from "@/lib/use-auth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { errorMessage } from "@/types/api";

const themes = [
  { id: "default", name: "Default", bg: "from-brand-600 to-blue-600", accent: "brand" },
  { id: "dark", name: "Dark mode", bg: "from-gray-800 to-gray-900", accent: "gray" },
  { id: "gradient", name: "Sunset", bg: "from-orange-500 to-pink-500", accent: "orange" },
  { id: "forest", name: "Forest", bg: "from-emerald-600 to-teal-700", accent: "emerald" },
  { id: "ocean", name: "Ocean", bg: "from-cyan-500 to-blue-600", accent: "cyan" },
];

export default function StorefrontPage() {
  const { data: session, status } = useSession();
  const { user } = useAuth();
  const router = useRouter();
  const [storefront, setStorefront] = useState<{ id?: string; subdomain: string; title: string; description: string; theme: string; logoUrl: string; published: boolean } | null>(null);
  const [form, setForm] = useState({ subdomain: "", title: "", description: "", theme: "default", logoUrl: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") {
      fetch(`/api/storefront?userId=${user?.id}`).then(async r => {
        if (!r.ok) throw new Error(`Request failed: ${r.status}`);
        const data = await r.json();
        if (data && data.id) { setStorefront(data); setForm({ subdomain: data.subdomain || "", title: data.title || "", description: data.description || "", theme: data.theme || "default", logoUrl: data.logoUrl || "" }); }
        else setForm(f => ({ ...f, subdomain: (session.user?.name || "").toLowerCase().replace(/[^a-z0-9]/g, ""), title: session?.user?.name + "'s Store" || "" }));
      }).catch(err => setError(errorMessage(err)));
    }
  }, [status, router, session]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/storefront", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = await res.json();
      if (res.ok) { setStorefront(data); setMessage("Storefront saved!"); }
      else setMessage("Error: " + data.error);
    } catch (err: unknown) {
      setError(errorMessage(err));
    }
    setSaving(false);
    setTimeout(() => setMessage(""), 3000);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold dark:text-gray-100">Storefront builder</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Your branded storefront at {form.subdomain || "..."}.shelf.io</p>
          </div>
          {storefront?.published && (
            <a href={`/store/${storefront.subdomain}`} target="_blank" className="btn-secondary text-sm">Preview</a>
          )}
        </div>

        {message && <div className={`text-sm p-3 rounded-lg mb-4 ${message.includes("Error") ? "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300" : "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300"}`}>{message}</div>}
        {error && <div className="text-red-500 dark:text-red-400 p-4 text-center bg-red-50 dark:bg-red-900/30 rounded-lg mb-4">{error}</div>}

        <div className="grid md:grid-cols-5 gap-8">
          <form onSubmit={handleSave} className="md:col-span-3 card space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Subdomain</label>
              <div className="flex items-center">
                <input className="input rounded-r-none" value={form.subdomain} onChange={e => setForm({ ...form, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })} required />
                <span className="input rounded-l-none bg-gray-50 text-gray-400 border-l-0 dark:bg-gray-700 dark:text-gray-500 dark:border-gray-600">.shelf.io</span>
              </div>
            </div>
            <div><label className="block text-sm font-medium mb-1">Store title</label><input className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required /></div>
            <div><label className="block text-sm font-medium mb-1">Description</label><textarea className="input min-h-[80px]" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
            <div><label className="block text-sm font-medium mb-1">Logo URL</label><input className="input" value={form.logoUrl} onChange={e => setForm({ ...form, logoUrl: e.target.value })} placeholder="https://..." /></div>
            <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? "Saving..." : storefront?.published ? "Update storefront" : "Publish storefront"}</button>
          </form>

          <div className="md:col-span-2">
            <h3 className="font-semibold mb-4">Choose theme</h3>
            <div className="space-y-2">
              {themes.map(t => (
                <div key={t.id} onClick={() => setForm({ ...form, theme: t.id })} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setForm({ ...form, theme: t.id }); } }} aria-label={`Select ${t.name} theme`} className={`p-3 rounded-lg cursor-pointer border-2 transition-all ${form.theme === t.id ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20" : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${t.bg} shrink-0`} />
                    <span className="text-sm font-medium">{t.name}</span>
                    {form.theme === t.id && <span className="ml-auto text-xs text-brand-600 font-medium dark:text-brand-400">Active</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
