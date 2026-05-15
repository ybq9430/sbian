"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { formatCurrency, formatDate } from "@/lib/utils";
import { errorMessage, type ActivityItem } from "@/types/api";

const icons: Record<string, string> = { purchase: "💰", new_product: "🆕", review: "⭐", follow: "👤" };

export default function ActivityPage() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/activity")
      .then(r => { if (!r.ok) throw new Error(`Request failed: ${r.status}`); return r.json(); })
      .then(setActivities)
      .catch(err => setError(errorMessage(err)));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-2 dark:text-gray-100">Activity feed</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">See what's happening across the platform.</p>

        {error && <div className="text-red-500 dark:text-red-400 p-4 text-center bg-red-50 dark:bg-red-900/30 rounded-lg mb-4">{error}</div>}

        <div className="space-y-3">
          {activities.map((a, i) => (
            <div key={i} className="card dark:bg-gray-800 dark:border-gray-700 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-lg shrink-0">{icons[a.type]}</div>
              <div className="flex-1 min-w-0">
                {a.type === "purchase" && <p className="text-sm dark:text-gray-200"><Link href={`/creator/${a.user?.id}`} className="font-medium text-brand-600">{a.user?.name}</Link> purchased <Link href={`/products/${a.product?.id}`} className="font-medium">{a.product?.title}</Link> <span className="text-green-600 font-medium">{formatCurrency(a.price || 0)}</span></p>}
                {a.type === "new_product" && <p className="text-sm dark:text-gray-200"><Link href={`/creator/${a.seller?.id}`} className="font-medium text-brand-600">{a.seller?.name}</Link> launched <Link href={`/products/${a.product?.id}`} className="font-medium">{a.product?.title}</Link></p>}
                {a.type === "review" && <p className="text-sm dark:text-gray-200"><Link href={`/creator/${a.user?.id}`} className="font-medium text-brand-600">{a.user?.name}</Link> reviewed <Link href={`/products/${a.product?.id}`} className="font-medium">{a.product?.title}</Link> · {"★".repeat(a.rating || 0)}</p>}
                {a.type === "follow" && <p className="text-sm dark:text-gray-200"><Link href={`/creator/${a.follower?.id}`} className="font-medium text-brand-600">{a.follower?.name}</Link> followed <Link href={`/creator/${a.following?.id}`} className="font-medium">{a.following?.name}</Link></p>}
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{formatDate(a.date)}</p>
              </div>
            </div>
          ))}
          {activities.length === 0 && <div className="card dark:bg-gray-800 text-center py-12"><p className="text-gray-400 dark:text-gray-500">No activity yet.</p></div>}
        </div>
      </div>
    </div>
  );
}
