"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { formatDate } from "@/lib/utils";
import { errorMessage } from "@/types/api";
import type { NotificationData } from "@/types/api";

export default function NotificationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<{ notifications: NotificationData[]; unreadCount: number }>({ notifications: [], unreadCount: 0 });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") {
      fetch("/api/notifications")
        .then(r => { if (!r.ok) throw new Error(`Request failed: ${r.status}`); return r.json(); })
        .then(setData)
        .catch(err => setError(errorMessage(err)));
    }
  }, [status, router]);

  async function markRead(id?: string) {
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(id ? { id } : {}),
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    } catch (err: unknown) {
      setError(errorMessage(err));
      return;
    }
    setData((prev) => ({
      notifications: prev.notifications.map((n) => id ? (n.id === id ? { ...n, read: true } : n) : { ...n, read: true }),
      unreadCount: id ? Math.max(0, prev.unreadCount - 1) : 0,
    }));
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold dark:text-gray-100">Notifications</h1>
          {data.unreadCount > 0 && (
            <button onClick={() => markRead()} className="text-sm text-brand-600 hover:underline">Mark all read</button>
          )}
        </div>

        {error && <div className="text-red-500 dark:text-red-400 p-4 text-center bg-red-50 dark:bg-red-900/30 rounded-lg mb-4">{error}</div>}

        {data.notifications.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-400 dark:text-gray-500">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {data.notifications.map((n: NotificationData) => (
              <div key={n.id} className={`card flex items-start gap-4 cursor-pointer transition-colors ${!n.read ? "bg-brand-50 border-brand-200 dark:bg-brand-900/20 dark:border-brand-700" : ""}`} onClick={() => { if (!n.read) markRead(n.id); if (n.link) router.push(n.link); }} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); if (!n.read) markRead(n.id); if (n.link) router.push(n.link); } }} aria-label="Mark as read">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 ${
                  n.type === "follow" ? "bg-blue-100 dark:bg-blue-900/50" :
                  n.type === "sale" ? "bg-green-100 dark:bg-green-900/50" :
                  n.type === "badge" ? "bg-yellow-100 dark:bg-yellow-900/50" :
                  "bg-gray-100 dark:bg-gray-700"
                }`}>
                  {n.type === "follow" ? "👤" : n.type === "sale" ? "💰" : n.type === "badge" ? "🏆" : "📢"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">{n.title}</h3>
                    {!n.read && <span className="w-2 h-2 bg-brand-500 rounded-full shrink-0" />}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5 dark:text-gray-400">{n.body}</p>
                  <p className="text-xs text-gray-400 mt-1 dark:text-gray-500">{formatDate(n.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
