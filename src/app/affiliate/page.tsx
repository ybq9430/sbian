"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { formatCurrency } from "@/lib/utils";

export default function AffiliatePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [affiliate, setAffiliate] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") {
      fetch("/api/affiliate").then(r => r.json()).then(setAffiliate);
    }
  }, [status, router]);

  const refLink = `https://shelf.io/ref/${affiliate?.code}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">Affiliate program</h1>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="stat"><span className="stat-label">Your code</span><span className="stat-value text-lg font-mono">{affiliate?.code || "Loading..."}</span></div>
          <div className="stat"><span className="stat-label">Commission rate</span><span className="stat-value">{((affiliate?.commission || 0.1) * 100).toFixed(0)}%</span></div>
          <div className="stat"><span className="stat-label">Total earnings</span><span className="stat-value text-green-600">{formatCurrency(affiliate?.earnings || 0)}</span></div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="stat"><span className="stat-label">Clicks</span><span className="stat-value">{affiliate?.clickCount || 0}</span></div>
          <div className="stat"><span className="stat-label">Conversions</span><span className="stat-value">{affiliate?.conversionCount || 0}</span></div>
          <div className="stat"><span className="stat-label">Conv. rate</span><span className="stat-value">{affiliate?.clickCount > 0 ? ((affiliate?.conversionCount / affiliate?.clickCount) * 100).toFixed(1) + "%" : "0%"}</span></div>
        </div>

        <div className="card mb-8">
          <h2 className="font-semibold mb-2">Your referral link</h2>
          <p className="text-sm text-gray-500 mb-4">Share this link anywhere. When someone clicks and buys, you earn {((affiliate?.commission || 0.1) * 100).toFixed(0)}% commission.</p>
          <div className="flex gap-2">
            <input readOnly value={refLink} className="input flex-1 font-mono text-sm" />
            <button onClick={() => { navigator.clipboard.writeText(refLink); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="btn-primary">
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        <div className="card">
          <h2 className="font-semibold mb-4">How it works</h2>
          <div className="space-y-4">
            {[
              { step: 1, title: "Share your link", desc: "Post your unique referral link on social media, blogs, newsletters, or anywhere your audience is." },
              { step: 2, title: "People click and buy", desc: "When someone uses your link to visit Shelf and makes a purchase within 30 days, you get credit." },
              { step: 3, title: "Earn commissions", desc: `You earn ${((affiliate?.commission || 0.1) * 100).toFixed(0)}% of every sale. Payouts are processed monthly to your wallet.` },
            ].map((s) => (
              <div key={s.step} className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center text-sm font-bold shrink-0">{s.step}</div>
                <div>
                  <h3 className="font-medium">{s.title}</h3>
                  <p className="text-sm text-gray-500">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
