"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { errorMessage, type TeamMemberData, type ProductData } from "@/types/api";

export default function TeamPage() {
  const { productId } = useParams();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [members, setMembers] = useState<TeamMemberData[]>([]);
  const [product, setProduct] = useState<ProductData | null>(null);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("editor");
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") {
      fetch(`/api/products/${productId}`)
        .then(r => { if (!r.ok) throw new Error(`Request failed: ${r.status}`); return r.json(); })
        .then(setProduct)
        .catch(err => setError(errorMessage(err)));
      fetch(`/api/team?productId=${productId}`)
        .then(r => { if (!r.ok) throw new Error(`Request failed: ${r.status}`); return r.json(); })
        .then(setMembers)
        .catch(err => setError(errorMessage(err)));
    }
  }, [productId, status, router]);

  async function addMember(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, email, role }),
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = await res.json();
      if (res.ok) { setMembers([...members, data]); setEmail(""); setMessage("Member added!"); }
      else setMessage("Error: " + data.error);
    } catch (err: unknown) {
      setError(errorMessage(err));
    }
    setAdding(false);
    setTimeout(() => setMessage(""), 3000);
  }

  async function removeMember(userId: string) {
    try {
      const res = await fetch("/api/team", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, userId }),
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    } catch (err: unknown) {
      setError(errorMessage(err));
      return;
    }
    setMembers(members.filter(m => m.userId !== userId));
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold dark:text-gray-100">Team: {product?.title}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Collaborate with others on this product</p>
        </div>

        {message && <div className={`text-sm p-3 rounded-lg mb-4 ${message.includes("Error") ? "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300" : "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300"}`}>{message}</div>}
        {error && <div className="text-red-500 dark:text-red-400 p-4 text-center bg-red-50 dark:bg-red-900/30 rounded-lg mb-4">{error}</div>}

        <form onSubmit={addMember} className="card mb-8 flex items-end gap-3">
          <div className="flex-1"><label className="block text-sm font-medium mb-1">Email</label><input className="input" value={email} onChange={e => setEmail(e.target.value)} placeholder="teammate@email.com" required /></div>
          <div><label className="block text-sm font-medium mb-1">Role</label>
            <select className="input" value={role} onChange={e => setRole(e.target.value)}>
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button type="submit" disabled={adding} className="btn-primary">{adding ? "Adding..." : "Add"}</button>
        </form>

        <div className="card">
          <h2 className="font-semibold mb-4">Team members ({members.length})</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 pb-3 border-b dark:border-gray-700">
              <div className="w-8 h-8 rounded-full bg-yellow-500 text-white flex items-center justify-center text-xs font-bold">👑</div>
              <div className="flex-1"><p className="text-sm font-medium">{product?.seller?.name} <span className="text-xs text-yellow-600">(Owner)</span></p></div>
            </div>
            {members.map(m => (
              <div key={m.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold">{m.user?.name?.[0]}</div>
                <div className="flex-1"><p className="text-sm font-medium">{m.user?.name}</p><p className="text-xs text-gray-400 dark:text-gray-500">{m.user?.email}</p></div>
                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full capitalize dark:bg-gray-700 dark:text-gray-400">{m.role}</span>
                <button onClick={() => removeMember(m.userId)} className="text-xs text-red-500 hover:underline">Remove</button>
              </div>
            ))}
            {members.length === 0 && <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">No team members yet. Invite collaborators above.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
