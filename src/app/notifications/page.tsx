"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { formatDate } from "@/lib/utils";

export default function NotificationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<any>({ notifications: [], unreadCount: 0 });

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") fetch("/api/notifications").then(r => r.json()).then(setData);
  }, [status, router]);

  async function markRead(id?: string) {
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(id ? { id } : {}),
    });
    setData((prev: any) => ({
      notifications: prev.notifications.map((n: any) => id ? (n.id === id ? { ...n, read: true } : n) : { ...n, read: true }),
      unreadCount: id ? Math.max(0, prev.unreadCount - 1) : 0,
    }));
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Notifications</h1>
          {data.unreadCount > 0 && (
            <button onClick={() => markRead()} className="text-sm text-brand-600 hover:underline">Mark all read</button>
          )}
        </div>

        {data.notifications.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-400">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {data.notifications.map((n: any) => (
              <div key={n.id} className={`card flex items-start gap-4 cursor-pointer transition-colors ${!n.read ? "bg-brand-50 border-brand-200" : ""}`} onClick={() => { if (!n.read) markRead(n.id); if (n.link) router.push(n.link); }}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 ${
                  n.type === "follow" ? "bg-blue-100" :
                  n.type === "sale" ? "bg-green-100" :
                  n.type === "badge" ? "bg-yellow-100" :
                  "bg-gray-100"
                }`}>
                  {n.type === "follow" ? "👤" : n.type === "sale" ? "💰" : n.type === "badge" ? "🏆" : "📢"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">{n.title}</h3>
                    {!n.read && <span className="w-2 h-2 bg-brand-500 rounded-full shrink-0" />}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{n.body}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatDate(n.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
