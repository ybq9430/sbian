"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { formatCurrency } from "@/lib/utils";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory) params.set("category", selectedCategory);
    if (search) params.set("search", search);
    fetch(`/api/products?${params}`).then(r => r.json()).then(d => {
      setProducts(d.products);
      if (!categories.length) {
        const cats = [...new Set(d.products.map((p: any) => p.category).filter(Boolean))] as string[];
        setCategories(cats);
      }
    });
  }, [selectedCategory, search]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl font-bold">Products</h1>
          <div className="flex gap-3">
            <input className="input max-w-xs" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
            <select className="input max-w-[160px]" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
              <option value="">All categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(p => (
            <Link key={p.id} href={`/products/${p.id}`} className="card hover:shadow-md transition-shadow group">
              <div className="aspect-video bg-gradient-to-br from-brand-100 to-blue-100 rounded-lg mb-4 flex items-center justify-center text-4xl">
                {p.coverImage ? <img src={p.coverImage} alt={p.title} className="w-full h-full object-cover rounded-lg" /> : "📦"}
              </div>
              <h3 className="font-semibold group-hover:text-brand-600 transition-colors">{p.title}</h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{p.description}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-lg font-bold text-brand-700">{formatCurrency(p.price)}</span>
                <span className="text-xs text-gray-400">{p.salesCount} sold</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">by {p.seller?.name}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
