"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { errorMessage } from "@/types/api";

const categories = ["E-book", "Course", "Template", "Software", "Design", "Audio", "Video", "Other"];

export default function AIStudioPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [form, setForm] = useState({ title: "", category: "E-book", keywords: "" });
  const [result, setResult] = useState<{ descriptions: string[]; titleSuggestions: string[]; tags: string; tips: string[]; pricing: { min: number; recommended: number; max: number } } | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedDesc, setSelectedDesc] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/describe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = await res.json();
      setResult(data);
    } catch (err: unknown) {
      setError(errorMessage(err));
    }
    setLoading(false);
  }

  function handleUseResult() {
    if (result) {
      const params = new URLSearchParams({
        title: form.title,
        description: result.descriptions[selectedDesc],
        category: form.category,
        tags: result.tags,
        price: String(result.pricing.recommended),
      });
      router.push(`/products/new?${params}`);
    }
  }

  if (status === "unauthenticated") { router.push("/login"); return null; }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2 dark:text-gray-100">AI Product Studio</h1>
          <p className="text-gray-500 text-sm dark:text-gray-400">Generate product descriptions, pricing recommendations, and tags using AI.</p>
        </div>

        {error && <div className="text-red-500 dark:text-red-400 p-4 text-center bg-red-50 dark:bg-red-900/30 rounded-lg mb-4">{error}</div>}

        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <form onSubmit={handleGenerate} className="card space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Product name</label>
                <input className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. JavaScript Mastery Guide" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Keywords (comma-separated)</label>
                <input className="input" value={form.keywords} onChange={e => setForm({ ...form, keywords: e.target.value })} placeholder="e.g. programming, beginner, tutorial" />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? <span className="flex items-center justify-center gap-2"><span className="animate-spin">⟳</span> Generating...</span> : "Generate with AI"}
              </button>
            </form>

            {result && (
              <div className="card mt-6">
                <h3 className="font-semibold mb-3">Pricing recommendation</h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg flex-1 dark:bg-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Min</p>
                    <p className="font-bold">¥{result.pricing.min}</p>
                  </div>
                  <div className="text-center p-3 bg-brand-50 rounded-lg flex-1 border border-brand-200 dark:bg-brand-900/30 dark:border-brand-700">
                    <p className="text-xs text-brand-600 font-medium dark:text-brand-400">Recommended</p>
                    <p className="font-bold text-brand-700 dark:text-brand-300">¥{result.pricing.recommended}</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg flex-1 dark:bg-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Max</p>
                    <p className="font-bold">¥{result.pricing.max}</p>
                  </div>
                </div>

                <h3 className="font-semibold mb-3">Title alternatives</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {result.titleSuggestions.map((t: string, i: number) => (
                    <button key={i} type="button" className="text-xs bg-gray-100 px-2 py-1 rounded-full cursor-pointer hover:bg-brand-100 dark:bg-gray-700 dark:hover:bg-brand-900/30" onClick={() => setForm({ ...form, title: t })}>
                      {t}
                    </button>
                  ))}
                </div>

                <h3 className="font-semibold mb-3">Smart tips</h3>
                <ul className="space-y-1.5 mb-4">
                  {result.tips.map((t: string, i: number) => (
                    <li key={i} className="text-xs text-gray-600 flex items-start gap-2 dark:text-gray-400">
                      <span className="text-brand-500 mt-0.5">✦</span> {t}
                    </li>
                  ))}
                </ul>

                {result.tags && (
                  <>
                    <h3 className="font-semibold mb-2">Suggested tags</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {result.tags.split(", ").map((t: string, i: number) => (
                        <span key={i} className="text-xs bg-brand-50 text-brand-700 px-2 py-1 rounded-full dark:bg-brand-900/30 dark:text-brand-300">{t}</span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <div>
            {result ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Generated descriptions</h3>
                  <button onClick={handleUseResult} className="btn-primary text-sm !px-3 !py-1.5">Use selected →</button>
                </div>
                {result.descriptions.map((desc: string, i: number) => (
                  <div key={i} onClick={() => setSelectedDesc(i)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedDesc(i); } }} aria-label={`Select description version ${i + 1}`} className={`card cursor-pointer transition-all ${selectedDesc === i ? "ring-2 ring-brand-500 shadow-md" : "hover:shadow-md"}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-brand-600 dark:text-brand-400">Version {i + 1}</span>
                      {selectedDesc === i && <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full dark:bg-brand-900/50 dark:text-brand-300">Selected</span>}
                    </div>
                    <div className="text-sm text-gray-600 whitespace-pre-line leading-relaxed dark:text-gray-400">{desc}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card text-center py-16">
                <div className="text-6xl mb-4">🤖</div>
                <h3 className="font-semibold text-lg mb-2">AI Description Generator</h3>
                <p className="text-sm text-gray-400 max-w-xs mx-auto dark:text-gray-500">Fill in the form and hit generate. The AI will create optimized product descriptions, suggest pricing, and generate tags.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
