"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Registration failed"); setLoading(false); return; }
    await signIn("credentials", { email: form.email, password: form.password, redirect: false });
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
      <div className="card max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-brand-700">Shelf</Link>
          <h1 className="text-xl font-semibold mt-4">Create your account</h1>
          <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">Start selling in minutes</p>
        </div>
        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 dark:bg-red-900/30 dark:text-red-300">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Name</label><input className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
          <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" className="input" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required /></div>
          <div><label className="block text-sm font-medium mb-1">Password</label><input type="password" className="input" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required minLength={6} /></div>
          <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? "Creating account..." : "Create account"}</button>
        </form>
        <p className="text-sm text-center text-gray-500 mt-6 dark:text-gray-400">
          Already have an account? <Link href="/login" className="text-brand-600 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
