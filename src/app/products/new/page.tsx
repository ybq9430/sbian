"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";

export default function NewProductPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [form, setForm] = useState({ title: "", description: "", price: 0, category: "", coverImage: "", fileUrl: "" });
  const [loading, setLoading] = useState(false);

  if (status === "unauthenticated") { router.push("/login"); return null; }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, status: "published" }),
    });
    if (res.ok) router.push("/dashboard");
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">Create new product</h1>
        <form onSubmit={handleSubmit} className="card space-y-5">
          <div><label className="block text-sm font-medium mb-1">Title</label><input className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required /></div>
          <div><label className="block text-sm font-medium mb-1">Description</label><textarea className="input min-h-[120px]" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Price (¥)</label><input type="number" step="0.01" className="input" value={form.price || ""} onChange={e => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} required /></div>
            <div><label className="block text-sm font-medium mb-1">Category</label>
              <select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required>
                <option value="">Select...</option>
                {["E-book", "Course", "Template", "Software", "Design", "Audio", "Video", "Other"].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div><label className="block text-sm font-medium mb-1">Cover image URL</label><input className="input" value={form.coverImage} onChange={e => setForm({ ...form, coverImage: e.target.value })} placeholder="https://..." /></div>
          <div><label className="block text-sm font-medium mb-1">File URL (product delivery)</label><input className="input" value={form.fileUrl} onChange={e => setForm({ ...form, fileUrl: e.target.value })} placeholder="https://..." /></div>
          <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? "Creating..." : "Publish product"}</button>
        </form>
      </div>
    </div>
  );
}
