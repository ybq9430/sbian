"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import { formatCurrency } from "@/lib/utils";

export default function CheckoutPage() {
  const { productId } = useParams();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login?redirect=" + encodeURIComponent(`/checkout/${productId}`));
    fetch(`/api/products/${productId}`).then(r => r.json()).then(setProduct);
  }, [productId, status, router]);

  async function handleFreeCheckout() {
    setLoading(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: [{ productId: product.id, price: product.price, quantity: 1 }] }),
    });
    if (res.ok) router.push("/orders?success=true");
    else alert("Checkout failed");
    setLoading(false);
  }

  async function handleStripeCheckout() {
    setLoading(true);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    setLoading(false);
  }

  if (!product) return <div className="min-h-screen bg-gray-50"><Navbar /><div className="max-w-3xl mx-auto p-8">Loading...</div></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? "bg-brand-600 text-white" : "bg-gray-200 text-gray-500"}`}>1</div>
          <div className="flex-1 h-0.5 bg-gray-200"><div className={`h-full transition-all ${step >= 2 ? "bg-brand-600 w-full" : "w-0"}`} /></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? "bg-brand-600 text-white" : "bg-gray-200 text-gray-500"}`}>2</div>
        </div>

        <div className="grid md:grid-cols-5 gap-8">
          <div className="md:col-span-3">
            <div className="card">
              <h2 className="font-semibold mb-4">Order summary</h2>
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 bg-gradient-to-br from-brand-100 to-blue-100 rounded-lg flex items-center justify-center text-2xl">📦</div>
                <div className="flex-1">
                  <h3 className="font-semibold">{product.title}</h3>
                  <p className="text-sm text-gray-500">{product.category} · by {product.seller?.name}</p>
                </div>
                <div className="text-lg font-bold text-brand-700">{formatCurrency(product.price)}</div>
              </div>
            </div>

            <div className="card mt-6">
              <h2 className="font-semibold mb-4">Payment method</h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 border border-brand-300 bg-brand-50 rounded-lg cursor-pointer">
                  <input type="radio" name="payment" defaultChecked className="text-brand-600" />
                  <span className="text-sm font-medium">Credit / Debit Card</span>
                  <span className="ml-auto text-xs text-gray-400">Stripe</span>
                </label>
                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer">
                  <input type="radio" name="payment" className="text-brand-600" />
                  <span className="text-sm font-medium">Wallet Balance ({formatCurrency(0)})</span>
                  <span className="ml-auto text-xs text-gray-400">Insufficient</span>
                </label>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="card sticky top-20">
              <h3 className="font-semibold mb-4">Payment details</h3>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatCurrency(product.price)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Platform fee</span><span>{formatCurrency(0)}</span></div>
                <div className="flex justify-between border-t pt-2 mt-2"><span className="font-semibold">Total</span><span className="text-lg font-bold text-brand-700">{formatCurrency(product.price)}</span></div>
              </div>
              <button onClick={handleStripeCheckout} disabled={loading} className="btn-primary w-full !py-3 rounded-xl">
                {loading ? "Processing..." : `Pay ${formatCurrency(product.price)}`}
              </button>
              <p className="text-xs text-gray-400 text-center mt-3">Secured by Stripe. 30-day money-back guarantee.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
