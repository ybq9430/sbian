import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-blue-50 py-24 sm:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-gray-900 mb-6">
              Build your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-blue-600">
                digital empire
              </span>
            </h1>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
              The all-in-one platform to create, market, and sell digital products.
              From ebooks to courses, templates to software — turn your knowledge into revenue.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/register" className="btn-primary text-lg !px-8 !py-3 rounded-xl shadow-lg shadow-brand-200">
                Start selling free
              </Link>
              <Link href="/products" className="btn-secondary text-lg !px-8 !py-3 rounded-xl">
                Browse products
              </Link>
            </div>
            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-400">
              <span className="flex items-center gap-2"><span className="w-2 h-2 bg-green-400 rounded-full" /> No upfront cost</span>
              <span className="flex items-center gap-2"><span className="w-2 h-2 bg-green-400 rounded-full" /> 10% platform fee</span>
              <span className="flex items-center gap-2"><span className="w-2 h-2 bg-green-400 rounded-full" /> Instant payouts</span>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything you need to sell</h2>
              <p className="text-gray-500 max-w-xl mx-auto">From product creation to payment processing, analytics to customer management — we handle the heavy lifting.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: "Storefront", desc: "Beautiful product pages optimized for conversion. Customize your brand and showcase your work.", icon: "🏪" },
                { title: "Payments", desc: "Accept payments globally via Stripe. Support for credit cards, Alipay, WeChat Pay, and more.", icon: "💳" },
                { title: "Analytics", desc: "Real-time dashboard with sales data, traffic insights, and revenue projections to grow your business.", icon: "📊" },
                { title: "Digital Delivery", desc: "Automatic file delivery after purchase. Secure download links with expiration and anti-sharing protection.", icon: "📦" },
                { title: "Affiliate System", desc: "Built-in affiliate marketing. Let others promote your products and earn commissions.", icon: "🤝" },
                { title: "API Access", desc: "Full REST API for custom integrations. Connect with your existing tools and workflows.", icon: "🔌" },
              ].map((f, i) => (
                <div key={i} className="card hover:shadow-md transition-shadow">
                  <div className="text-3xl mb-4">{f.icon}</div>
                  <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[{ v: "10,000+", l: "Creators" }, { v: "50,000+", l: "Products sold" }, { v: "¥12M+", l: "Earned by creators" }, { v: "98%", l: "Satisfaction rate" }].map((s, i) => (
                <div key={i}>
                  <div className="text-3xl font-bold text-brand-700 mb-1">{s.v}</div>
                  <div className="text-sm text-gray-500">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple, transparent pricing</h2>
              <p className="text-gray-500 max-w-xl mx-auto">Start for free. Pay only when you make money.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                { name: "Starter", price: "Free", fee: "10%", features: ["5 products", "Basic analytics", "Standard support", "1GB storage"], cta: "Get started", primary: false },
                { name: "Pro", price: "¥99/mo", fee: "5%", features: ["50 products", "Advanced analytics", "Priority support", "10GB storage", "Affiliate system", "Custom domain"], cta: "Start free trial", primary: true },
                { name: "Enterprise", price: "¥499/mo", fee: "2%", features: ["Unlimited products", "Real-time analytics", "Dedicated support", "100GB storage", "White-label", "API access", "Team accounts"], cta: "Contact sales", primary: false },
              ].map((p, i) => (
                <div key={i} className={`card relative ${p.primary ? "ring-2 ring-brand-500 shadow-lg scale-105" : ""}`}>
                  {p.primary && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-xs px-3 py-1 rounded-full">Most popular</span>}
                  <h3 className="font-semibold text-lg mb-1">{p.name}</h3>
                  <div className="text-3xl font-bold mb-1">{p.price}</div>
                  <div className="text-sm text-gray-500 mb-4">{p.fee} transaction fee</div>
                  <ul className="space-y-2 mb-6">
                    {p.features.map((f, j) => (
                      <li key={j} className="text-sm text-gray-600 flex items-center gap-2">
                        <span className="text-green-500 font-bold">+</span> {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/register" className={p.primary ? "btn-primary w-full rounded-lg" : "btn-secondary w-full rounded-lg"}>
                    {p.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-gradient-to-r from-brand-700 to-blue-700">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to start selling?</h2>
            <p className="text-brand-100 mb-8">Join thousands of creators who turned their passion into profit. It takes less than 5 minutes to set up your first product.</p>
            <Link href="/register" className="inline-flex items-center px-8 py-3 bg-white text-brand-700 font-semibold rounded-xl hover:bg-brand-50 transition-colors shadow-lg">
              Create your free account
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
