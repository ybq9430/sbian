"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { formatCurrency } from "@/lib/utils";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [wallet, setWallet] = useState<any>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") {
      fetch("/api/analytics").then(r => r.json()).then(d => setWallet(d));
    }
  }, [status, router]);

  if (!wallet) return <div className="min-h-screen bg-gray-50"><Navbar /><div className="max-w-3xl mx-auto p-8">Loading...</div></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">Settings</h1>

        <div className="space-y-6">
          <div className="card">
            <h2 className="font-semibold mb-4">Profile</h2>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-brand-600 text-white flex items-center justify-center text-2xl font-bold">
                {session?.user?.name?.[0] || "U"}
              </div>
              <div>
                <p className="font-semibold">{session?.user?.name}</p>
                <p className="text-sm text-gray-500">{session?.user?.email}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="font-semibold mb-4">Wallet</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Available balance</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(wallet.walletBalance || 0)}</p>
              </div>
              <button className="btn-primary">Withdraw</button>
            </div>
          </div>

          <div className="card">
            <h2 className="font-semibold mb-4">Payment methods</h2>
            <p className="text-sm text-gray-400">Connect your bank account or Alipay to receive payments.</p>
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
