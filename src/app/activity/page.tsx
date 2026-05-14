"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { formatCurrency, formatDate } from "@/lib/utils";

const icons: Record<string, string> = { purchase: "💰", new_product: "🆕", review: "⭐", follow: "👤" };

export default function ActivityPage() {
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => { fetch("/api/activity").then(r => r.json()).then(setActivities); }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-2 dark:text-white">Activity feed</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">See what's happening across the platform.</p>

        <div className="space-y-3">
          {activities.map((a, i) => (
            <div key={i} className="card dark:bg-gray-800 dark:border-gray-700 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-lg shrink-0">{icons[a.type]}</div>
              <div className="flex-1 min-w-0">
                {a.type === "purchase" && <p className="text-sm dark:text-gray-200"><Link href={`/creator/${a.user?.id}`} className="font-medium text-brand-600">{a.user?.name}</Link> purchased <Link href={`/products/${a.product?.id}`} className="font-medium">{a.product?.title}</Link> <span className="text-green-600 font-medium">{formatCurrency(a.price)}</span></p>}
                {a.type === "new_product" && <p className="text-sm dark:text-gray-200"><Link href={`/creator/${a.seller?.id}`} className="font-medium text-brand-600">{a.seller?.name}</Link> launched <Link href={`/products/${a.product?.id}`} className="font-medium">{a.product?.title}</Link></p>}
                {a.type === "review" && <p className="text-sm dark:text-gray-200"><Link href={`/creator/${a.user?.id}`} className="font-medium text-brand-600">{a.user?.name}</Link> reviewed <Link href={`/products/${a.product?.id}`} className="font-medium">{a.product?.title}</Link> · {"★".repeat(a.rating)}</p>}
                {a.type === "follow" && <p className="text-sm dark:text-gray-200"><Link href={`/creator/${a.follower?.id}`} className="font-medium text-brand-600">{a.follower?.name}</Link> followed <Link href={`/creator/${a.following?.id}`} className="font-medium">{a.following?.name}</Link></p>}
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{formatDate(a.date)}</p>
              </div>
            </div>
          ))}
          {activities.length === 0 && <div className="card dark:bg-gray-800 text-center py-12"><p className="text-gray-400">No activity yet.</p></div>}
        </div>
      </div>
    </div>
  );
}
