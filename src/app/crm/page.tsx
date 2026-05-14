"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function CRMPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<any>({ customers: [], totalCustomers: 0, totalRevenue: 0, segments: [], notes: [] });
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [noteText, setNoteText] = useState("");
  const [tab, setTab] = useState("customers");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") fetch("/api/crm").then(r => r.json()).then(setData);
  }, [status, router]);

  async function addNote() {
    if (!noteText || !selectedCustomer) return;
    const res = await fetch("/api/crm", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "note", userId: selectedCustomer.customer.id, note: noteText }) });
    const entry = await res.json();
    if (res.ok) { setData({ ...data, notes: [entry, ...data.notes] }); setNoteText(""); }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-2">Customer CRM</h1>
        <p className="text-sm text-gray-500 mb-8">Manage customer relationships, notes, and segments.</p>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="stat"><span className="stat-label">Total customers</span><span className="stat-value">{data.totalCustomers}</span></div>
          <div className="stat"><span className="stat-label">Total revenue</span><span className="stat-value text-green-600">{formatCurrency(data.totalRevenue)}</span></div>
          <div className="stat"><span className="stat-label">Avg. per customer</span><span className="stat-value">{data.totalCustomers > 0 ? formatCurrency(data.totalRevenue / data.totalCustomers) : "¥0"}</span></div>
        </div>

        <div className="flex gap-2 mb-6">
          {[{ id: "customers", label: "Customers" }, { id: "segments", label: "Segments" }, { id: "notes", label: "Notes" }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`btn text-sm ${tab === t.id ? "btn-primary" : "btn-secondary"}`}>{t.label}</button>
          ))}
        </div>

        {tab === "customers" && (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm"><thead><tr className="text-left text-gray-500 border-b"><th className="pb-2">Customer</th><th className="pb-2">Email</th><th className="pb-2">Orders</th><th className="pb-2">Total spent</th><th className="pb-2">Last order</th><th className="pb-2" /></tr></thead>
              <tbody>
                {data.customers.map((c: any) => (
                  <tr key={c.customer.id} className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedCustomer(c)}>
                    <td className="py-2 font-medium">{c.customer.name}</td>
                    <td className="py-2 text-xs">{c.customer.email}</td>
                    <td className="py-2">{c.orderCount}</td>
                    <td className="py-2 font-semibold text-green-600">{formatCurrency(c.totalSpent)}</td>
                    <td className="py-2 text-xs text-gray-500">{formatDate(c.lastOrder)}</td>
                    <td className="py-2"><button className="text-xs text-brand-600 hover:underline">View</button></td>
                  </tr>
                ))}
                {data.customers.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-gray-400">No customers yet.</td></tr>}
              </tbody></table>
          </div>
        )}

        {tab === "notes" && (
          <div className="card">
            {data.notes.map((n: any) => (
              <div key={n.id} className="py-2 border-b border-gray-50"><p className="text-sm">{n.note}</p><p className="text-xs text-gray-400 mt-1">Customer: {n.userId?.slice(0,8)} · {formatDate(n.createdAt)}</p></div>
            ))}
            {data.notes.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No customer notes yet.</p>}
          </div>
        )}

        {tab === "segments" && (
          <div className="card text-center py-12">
            <p className="text-gray-400">Segments automatically group customers by behavior (VIP, repeat buyers, at-risk, etc.)</p>
          </div>
        )}

        {/* Selected customer detail modal */}
        {selectedCustomer && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-lg w-full max-h-[80vh] overflow-auto p-6">
              <div className="flex items-center justify-between mb-6"><h2 className="font-semibold text-lg">{selectedCustomer.customer.name}</h2><button onClick={() => setSelectedCustomer(null)} className="text-gray-400 hover:text-gray-600">✕</button></div>
              <div className="space-y-3 text-sm mb-6">
                <p><span className="text-gray-500">Email:</span> {selectedCustomer.customer.email}</p>
                <p><span className="text-gray-500">Orders:</span> {selectedCustomer.orderCount}</p>
                <p><span className="text-gray-500">Total spent:</span> <span className="font-bold text-green-600">{formatCurrency(selectedCustomer.totalSpent)}</span></p>
                <p><span className="text-gray-500">Last order:</span> {formatDate(selectedCustomer.lastOrder)}</p>
                <p><span className="text-gray-500">Customer since:</span> {formatDate(selectedCustomer.customer.createdAt)}</p>
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-2">Add note</h3>
                <textarea className="input text-sm min-h-[80px] mb-2" value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Write a note about this customer..." />
                <button onClick={addNote} disabled={!noteText} className="btn-primary text-sm">Save note</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
