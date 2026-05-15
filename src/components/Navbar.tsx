"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "./ThemeProvider";

export default function Navbar() {
  const { data: session } = useSession();
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false); }
    function onClick(e: MouseEvent) { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("mousedown", onClick); };
  }, [open]);
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    if (session) {
      fetch("/api/notifications").then(r => r.json()).then(d => setNotifCount(d.unreadCount || 0));
      const id = setInterval(() => {
        fetch("/api/notifications").then(r => r.json()).then(d => setNotifCount(d.unreadCount || 0));
      }, 30000);
      return () => clearInterval(id);
    }
  }, [session]);

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold text-brand-700 tracking-tight">Shelf</Link>
            <div className="hidden md:flex items-center gap-5">
              <Link href="/products" className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">Products</Link>
              <Link href="/search" className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">Search</Link>
              <Link href="/flash-deals" className="text-sm text-gray-600 dark:text-gray-300 hover:text-red-600 transition-colors flex items-center gap-1">
                <span>Deals</span><span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              </Link>
              <Link href="/activity" className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">Activity</Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggle} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-sm" aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
            {session ? (
              <>
                <Link href="/ai-studio" className="hidden sm:inline text-sm text-gray-600 dark:text-gray-300 hover:text-brand-600 transition-colors font-medium">AI Studio</Link>
                <Link href="/dashboard" className="hidden sm:inline text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Dashboard</Link>
                <Link href="/products/new" className="btn-primary text-sm !px-3 !py-1.5">Sell</Link>
                <Link href="/notifications" className="relative p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Notifications">
                  <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                  {notifCount > 0 && <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{notifCount > 9 ? "9+" : notifCount}</span>}
                </Link>
                <div className="relative" ref={menuRef}>
                  <button onClick={() => setOpen(!open)} className="flex items-center gap-2 text-sm p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="User menu" aria-haspopup="true" aria-expanded={open}>
                    <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center text-sm font-medium">
                      {session.user?.name?.[0] || "U"}
                    </div>
                  </button>
                  {open && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">{session.user?.email}</div>
                      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full"><div className="h-full bg-brand-500 rounded-full w-2/5" /></div>
                          <span className="text-gray-400 dark:text-gray-500">Lv.1</span>
                        </div>
                      </div>
                      <Link href="/dashboard" className="block px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200" onClick={() => setOpen(false)}>Dashboard</Link>
                      <Link href="/my-products" className="block px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200" onClick={() => setOpen(false)}>My products</Link>
                      <Link href="/orders" className="block px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200" onClick={() => setOpen(false)}>Orders</Link>
                      <Link href="/licenses" className="block px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200" onClick={() => setOpen(false)}>License keys</Link>
                      <Link href="/storefront" className="block px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200" onClick={() => setOpen(false)}>Storefront</Link>
                      <Link href="/subscriptions" className="block px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200" onClick={() => setOpen(false)}>Subscriptions</Link>
                      <Link href="/crm" className="block px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200" onClick={() => setOpen(false)}>CRM</Link>
                      <Link href="/analytics" className="block px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200" onClick={() => setOpen(false)}>Analytics</Link>
                      <Link href="/ab-tests" className="block px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200" onClick={() => setOpen(false)}>A/B Tests</Link>
                      <Link href="/marketing" className="block px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200" onClick={() => setOpen(false)}>Email marketing</Link>
                      <Link href="/developers" className="block px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200" onClick={() => setOpen(false)}>Developers</Link>
                      <Link href="/affiliate" className="block px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200" onClick={() => setOpen(false)}>Affiliate</Link>
                      <Link href="/settings" className="block px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200" onClick={() => setOpen(false)}>Settings</Link>
                      {session.user?.role === "admin" && <Link href="/admin" className="block px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200" onClick={() => setOpen(false)}>Admin panel</Link>}
                      <Link href="/api/export?type=orders" className="block px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200" onClick={() => setOpen(false)}>Export data</Link>
                      <button onClick={() => signOut()} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 dark:hover:bg-gray-700">Sign out</button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-secondary text-sm !px-3 !py-1.5">Sign in</Link>
                <Link href="/register" className="btn-primary text-sm !px-3 !py-1.5">Get started</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
