"use client";
import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { formatCurrency } from "@/lib/utils";
import { errorMessage, type SearchResults, ProductData } from "@/types/api";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [results, setResults] = useState<SearchResults | null>(null);
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [filters, setFilters] = useState({ category: "", minPrice: "", maxPrice: "", sort: "relevance", rating: "0", tags: "" });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const doSearch = useCallback(() => {
    const params = new URLSearchParams();
    if (debouncedQuery) params.set("q", debouncedQuery);
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    router.replace(`/search?${params}`);
    fetch(`/api/search?${params}`)
      .then(r => { if (!r.ok) throw new Error(`Request failed: ${r.status}`); return r.json(); })
      .then(setResults)
      .catch(err => setError(errorMessage(err)));
  }, [debouncedQuery, filters, router]);

  useEffect(() => { doSearch(); }, [doSearch]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && <div className="text-red-500 dark:text-red-400 p-4 text-center bg-red-50 dark:bg-red-900/30 rounded-lg mb-4">{error}</div>}
        <div className="flex gap-8">
          <div className="w-64 shrink-0 hidden lg:block">
            <div className="card space-y-5 sticky top-20">
              <h3 className="font-semibold">Filters</h3>
              <div><label className="text-xs font-medium text-gray-500 block mb-1.5 dark:text-gray-400">Category</label>
                <select className="input text-xs" value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value })}>
                  <option value="">All</option>
                  {["E-book", "Course", "Template", "Software", "Design", "Audio", "Video", "Other"].map(c => <option key={c} value={c}>{c}</option>)}
                </select></div>
              <div><label className="text-xs font-medium text-gray-500 block mb-1.5 dark:text-gray-400">Price range</label>
                <div className="flex gap-2"><input className="input text-xs w-20" placeholder="Min" type="number" value={filters.minPrice} onChange={e => setFilters({ ...filters, minPrice: e.target.value })} /><span className="text-gray-400 dark:text-gray-500">-</span><input className="input text-xs w-20" placeholder="Max" type="number" value={filters.maxPrice} onChange={e => setFilters({ ...filters, maxPrice: e.target.value })} /></div></div>
              <div><label className="text-xs font-medium text-gray-500 block mb-1.5 dark:text-gray-400">Min rating</label>
                <select className="input text-xs" value={filters.rating} onChange={e => setFilters({ ...filters, rating: e.target.value })}><option value="0">Any</option><option value="4">4+ stars</option><option value="4.5">4.5+ stars</option></select></div>
              <div><label className="text-xs font-medium text-gray-500 block mb-1.5 dark:text-gray-400">Sort</label>
                <select className="input text-xs" value={filters.sort} onChange={e => setFilters({ ...filters, sort: e.target.value })}><option value="relevance">Relevance</option><option value="price_asc">Price: Low to High</option><option value="price_desc">Price: High to Low</option><option value="best_selling">Best selling</option><option value="top_rated">Top rated</option></select></div>
              {results?.facets?.tags && results.facets.tags.length > 0 && <div><label className="text-xs font-medium text-gray-500 block mb-1.5 dark:text-gray-400">Popular tags</label><div className="flex flex-wrap gap-1">{results.facets.tags.map((t: string) => <button key={t} onClick={() => setFilters({ ...filters, tags: filters.tags === t ? "" : t })} className={`text-[10px] px-2 py-0.5 rounded-full ${filters.tags === t ? "bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300" : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"}`}>{t}</button>)}</div></div>}
              <button onClick={doSearch} className="btn-primary w-full text-sm">Apply filters</button>
            </div>
          </div>
          <div className="flex-1">
            <div className="mb-6"><input className="input text-lg" placeholder="Search products..." value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && doSearch()} autoFocus />{results && <p className="text-sm text-gray-500 mt-2 dark:text-gray-400">{results.total} results{results.query ? ` for "${results.query}"` : ""}</p>}</div>
            {results && <>
              <div className="flex gap-2 mb-4 lg:hidden"><select className="input text-xs flex-1" value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value })}><option value="">All categories</option>{results.facets.categories.map((c: string) => <option key={c} value={c}>{c}</option>)}</select><select className="input text-xs" value={filters.sort} onChange={e => setFilters({ ...filters, sort: e.target.value })}><option value="relevance">Relevance</option><option value="best_selling">Best selling</option><option value="top_rated">Top rated</option></select></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {results.products.map((p: ProductData) => (
                  <Link key={p.id} href={`/products/${p.id}`} className="card hover:shadow-md transition-shadow group">
                    <div className="aspect-video bg-gradient-to-br from-brand-100 to-blue-100 rounded-lg mb-3 flex items-center justify-center text-3xl">📦</div>
                    <h3 className="font-semibold text-sm group-hover:text-brand-600 line-clamp-1">{p.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5 dark:text-gray-500">{p.seller?.name} · {p.category}</p>
                    <div className="flex items-center justify-between mt-2"><span className="font-bold text-brand-700">{formatCurrency(p.price)}</span><span className="text-xs text-gray-400 dark:text-gray-500">{p.salesCount} sold · {p.rating.toFixed(1)}★</span></div>
                    {p.tags && <div className="flex flex-wrap gap-1 mt-2">{p.tags.split(", ").slice(0, 3).map((t: string) => <span key={t} className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-400">{t}</span>)}</div>}
                  </Link>
                ))}</div>
              {results.products.length === 0 && <div className="card text-center py-16"><p className="text-gray-400 dark:text-gray-500">No products found.</p></div>}
            </>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdvancedSearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 dark:bg-gray-900"><Navbar /><div className="max-w-7xl mx-auto p-8">Loading search...</div></div>}>
      <SearchContent />
    </Suspense>
  );
}
