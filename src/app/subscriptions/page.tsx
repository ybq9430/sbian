"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { formatCurrency, formatDate } from "@/lib/utils";
import { errorMessage, type SubscriptionData } from "@/types/api";

export default function SubscriptionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<{ mySubscriptions: (SubscriptionData & { canceledAt?: string })[]; plansSold: ({ id: string; product?: { title: string; price: number }; interval: string; subscriptions?: { length: number }[]; trialDays: number })[] }>({ mySubscriptions: [], plansSold: [] });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") {
      fetch("/api/subscriptions")
        .then(r => { if (!r.ok) throw new Error(`Request failed: ${r.status}`); return r.json(); })
        .then(setData)
        .catch(err => setError(errorMessage(err)));
    }
  }, [status, router]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-2 dark:text-gray-100">Subscriptions</h1>
        <p className="text-sm text-gray-500 mb-8 dark:text-gray-400">Manage recurring billing products and active subscriptions.</p>

        {error && <div className="text-red-500 dark:text-red-400 p-4 text-center bg-red-50 dark:bg-red-900/30 rounded-lg mb-4">{error}</div>}

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="font-semibold mb-4">My subscriptions ({data.mySubscriptions.length})</h2>
            {data.mySubscriptions.length === 0 ? (
              <div className="card text-center py-8"><p className="text-sm text-gray-400 dark:text-gray-500">No active subscriptions</p></div>
            ) : (
              <div className="space-y-3">
                {data.mySubscriptions.map((s: SubscriptionData & { canceledAt?: string }) => (
                  <div key={s.id} className="card"><div className="flex items-center justify-between"><div><h3 className="font-semibold">{s.plan?.product?.title}</h3><p className="text-xs text-gray-500 dark:text-gray-400">{s.plan?.interval} · {formatCurrency(s.plan?.product?.price || 0)}/{s.plan?.interval}</p></div><span className={`text-xs px-2 py-0.5 rounded-full ${s.status === "active" ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300" : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"}`}>{s.status}</span></div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-2">Started {formatDate(s.currentStart)} · {s.canceledAt ? `Canceled ${formatDate(s.canceledAt)}` : "Renews " + formatDate(s.currentEnd)}</div></div>
                ))}
              </div>
            )}
          </div>
          <div>
            <h2 className="font-semibold mb-4">Plans I sell ({data.plansSold.length})</h2>
            {data.plansSold.length === 0 ? (
              <div className="card text-center py-8"><p className="text-sm text-gray-400 dark:text-gray-500">No subscription plans set up. Create a product and enable subscriptions.</p></div>
            ) : (
              <div className="space-y-4">
                {data.plansSold.map((p: { id: string; product?: { title: string; price: number }; interval: string; subscriptions?: { length: number }[]; trialDays: number }) => (
                  <div key={p.id} className="card"><h3 className="font-semibold">{p.product?.title}</h3><p className="text-sm text-gray-500 dark:text-gray-400">{p.interval} · {formatCurrency(p.product?.price || 0)}/{p.interval}</p>
                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">{p.subscriptions?.length || 0} subscribers · {p.trialDays} day trial</div></div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
