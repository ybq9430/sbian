"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import { formatDate } from "@/lib/utils";
import { errorMessage } from "@/types/api";
import type { DiscussionData, ProductData, ReplyData } from "@/types/api";

export default function CommunityPage() {
  const { productId } = useParams();
  const { data: session } = useSession();
  const router = useRouter();
  const [discussions, setDiscussions] = useState<DiscussionData[]>([]);
  const [product, setProduct] = useState<ProductData | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ title: "", body: "" });
  const [replyForm, setReplyForm] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/products/${productId}`)
      .then(r => { if (!r.ok) throw new Error(`Request failed: ${r.status}`); return r.json(); })
      .then(setProduct)
      .catch(err => setError(errorMessage(err)));
    fetch(`/api/discussions?productId=${productId}`)
      .then(r => { if (!r.ok) throw new Error(`Request failed: ${r.status}`); return r.json(); })
      .then(setDiscussions)
      .catch(err => setError(errorMessage(err)));
  }, [productId]);

  async function handleCreateDiscussion(e: React.FormEvent) {
    e.preventDefault();
    if (!session) { router.push("/login"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/discussions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, title: form.title, body: form.body }),
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      if (res.ok) {
        const d = await res.json();
        setDiscussions([d, ...discussions]);
        setForm({ title: "", body: "" });
        setShowNew(false);
      }
    } catch (err: unknown) {
      setError(errorMessage(err));
    }
    setSubmitting(false);
  }

  async function handleReply(discussionId: string, parentId?: string) {
    if (!session) { router.push("/login"); return; }
    const body = replyForm[parentId || discussionId];
    if (!body) return;
    try {
      const res = await fetch(`/api/discussions/${discussionId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body, parentId }),
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      if (res.ok) {
        const updated = await fetch(`/api/discussions?productId=${productId}`)
          .then(r => { if (!r.ok) throw new Error(`Request failed: ${r.status}`); return r.json(); });
        setDiscussions(updated);
        setReplyForm({});
      }
    } catch (err: unknown) {
      setError(errorMessage(err));
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold dark:text-gray-100">{product?.title || "Community"}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Discussions & Q&A</p>
          </div>
          <button onClick={() => setShowNew(!showNew)} className="btn-primary">New discussion</button>
        </div>

        {error && <div className="text-red-500 dark:text-red-400 p-4 text-center bg-red-50 dark:bg-red-900/30 rounded-lg mb-4">{error}</div>}

        {showNew && (
          <form onSubmit={handleCreateDiscussion} className="card mb-6 space-y-4">
            <input className="input" placeholder="Discussion title..." value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            <textarea className="input min-h-[100px]" placeholder="What would you like to discuss?" value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} required />
            <div className="flex gap-2"><button type="submit" disabled={submitting} className="btn-primary">{submitting ? "Posting..." : "Post discussion"}</button><button type="button" onClick={() => setShowNew(false)} className="btn-secondary">Cancel</button></div>
          </form>
        )}

        {discussions.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="font-semibold mb-2">No discussions yet</h3>
            <p className="text-sm text-gray-400 mb-4 dark:text-gray-500">Be the first to start a conversation!</p>
            <button onClick={() => setShowNew(true)} className="btn-primary">Start discussion</button>
          </div>
        ) : (
          <div className="space-y-4">
            {discussions.map(d => (
              <div key={d.id} className="card">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold shrink-0">{d.user?.name?.[0]}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{d.title}</h3>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{d.user?.name} · {formatDate(d.createdAt)}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4 dark:text-gray-400">{d.body}</p>

                {/* Replies */}
                {d.replies && d.replies.length > 0 && (
                  <div className="border-t border-gray-100 dark:border-gray-800 pt-3 space-y-3 ml-6">
                    {d.replies.map((r: ReplyData) => (
                      <div key={r.id}>
                        <div className="flex items-start gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-400 text-white flex items-center justify-center text-[10px] font-bold shrink-0">{(r.user?.name?.[0])}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2"><span className="text-xs font-medium">{r.user?.name}</span><span className="text-[10px] text-gray-400 dark:text-gray-500">{formatDate(r.createdAt)}</span></div>
                            <p className="text-sm text-gray-600 mt-0.5 dark:text-gray-400">{r.body}</p>
                            <button onClick={() => setReplyForm({ ...replyForm, [r.id]: "" })} className="text-[10px] text-brand-600 mt-1">Reply</button>
                            {replyForm[r.id] !== undefined && (
                              <div className="flex gap-2 mt-1">
                                <input className="input text-xs !py-1 flex-1" placeholder="Write a reply..." value={replyForm[r.id] || ""} onChange={e => setReplyForm({ ...replyForm, [r.id]: e.target.value })} autoFocus />
                                <button onClick={() => handleReply(d.id, r.id)} className="btn-primary text-[10px] !px-2 !py-1">Send</button>
                              </div>
                            )}
                            {/* Nested replies */}
                            {r.children?.map((c: ReplyData) => (
                              <div key={c.id} className="flex items-start gap-2 mt-2 ml-4">
                                <div className="w-5 h-5 rounded-full bg-gray-300 text-white flex items-center justify-center text-[9px] font-bold shrink-0">{c.user?.name?.[0]}</div>
                                <div><span className="text-[11px] font-medium">{c.user?.name}</span><p className="text-xs text-gray-500 dark:text-gray-400">{c.body}</p></div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply input */}
                <div className="border-t border-gray-100 dark:border-gray-800 pt-3 mt-3">
                  {replyForm[d.id] !== undefined ? (
                    <div className="flex gap-2">
                      <input className="input text-sm flex-1" placeholder="Add a reply..." value={replyForm[d.id] || ""} onChange={e => setReplyForm({ ...replyForm, [d.id]: e.target.value })} autoFocus />
                      <button onClick={() => handleReply(d.id)} className="btn-primary text-xs !px-3">Reply</button>
                    </div>
                  ) : (
                    <button onClick={() => setReplyForm({ ...replyForm, [d.id]: "" })} className="text-sm text-brand-600">Add reply...</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
