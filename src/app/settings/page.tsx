"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { formatCurrency } from "@/lib/utils";
import { errorMessage, type WalletData } from "@/types/api";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") {
      fetch("/api/analytics")
        .then(r => { if (!r.ok) throw new Error(`Request failed: ${r.status}`); return r.json(); })
        .then(d => setWallet(d))
        .catch(err => setError(errorMessage(err)));
    }
  }, [status, router]);

  if (error) return <div className="min-h-screen bg-gray-50 dark:bg-gray-900"><Navbar /><div className="text-red-500 dark:text-red-400 p-4 text-center bg-red-50 dark:bg-red-900/30 rounded-lg mb-4 max-w-3xl mx-auto mt-8">{error}</div></div>;
  if (!wallet) return <div className="min-h-screen bg-gray-50 dark:bg-gray-900"><Navbar /><div className="max-w-3xl mx-auto p-8">Loading...</div></div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8 dark:text-gray-100">Settings</h1>

        <div className="space-y-6">
          <div className="card">
            <h2 className="font-semibold mb-4">Profile</h2>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-brand-600 text-white flex items-center justify-center text-2xl font-bold">
                {session?.user?.name?.[0] || "U"}
              </div>
              <div>
                <p className="font-semibold">{session?.user?.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{session?.user?.email}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="font-semibold mb-4">Wallet</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Available balance</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency("walletBalance" in wallet ? (wallet as { walletBalance: number }).walletBalance : 0)}</p>
              </div>
              <button className="btn-primary">Withdraw</button>
            </div>
          </div>

          <div className="card">
            <h2 className="font-semibold mb-4">Payment methods</h2>
            <p className="text-sm text-gray-400 dark:text-gray-500">Connect your bank account or Alipay to receive payments.</p>
            <button className="btn-secondary mt-3">Add payment method</button>
          </div>

          <div className="card">
            <h2 className="font-semibold mb-4">Notifications</h2>
            <div className="space-y-3">
              {["New sale alerts", "Weekly analytics report", "Product updates", "Marketing tips"].map((n, i) => (
                <label key={i} className="flex items-center justify-between">
                  <span className="text-sm">{n}</span>
                  <input type="checkbox" defaultChecked className="rounded" />
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
