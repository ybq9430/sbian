"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function CreatorProfilePage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [followData, setFollowData] = useState<any>(null);
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    fetch(`/api/follow?userId=${id}`).then(r => r.json()).then(d => { setFollowData(d); });
    fetch(`/api/products`).then(r => r.json()).then(d => {
      const userProducts = d.products.filter((p: any) => p.sellerId === id);
      setProducts(userProducts);
      if (userProducts.length > 0) setProfile({ name: userProducts[0].seller?.name, id: userProducts[0].sellerId });
    });
  }, [id]);

  async function handleFollow() {
    if (!session) { router.push("/login"); return; }
    const res = await fetch("/api/follow", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ followingId: id }) });
    const data = await res.json();
    setFollowing(data.following);
    setFollowData((prev: any) => ({ ...prev, followerCount: prev.followerCount + (data.following ? 1 : -1) }));
  }

  if (!profile) return <div className="min-h-screen bg-gray-50"><Navbar /><div className="max-w-4xl mx-auto p-8">Loading...</div></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="card mb-8">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-600 to-blue-600 text-white flex items-center justify-center text-3xl font-bold shrink-0">
              {profile.name?.[0] || "C"}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold">{profile.name}</h1>
                  <p className="text-sm text-gray-500">@{profile.name?.toLowerCase().replace(/\s+/g, "")}</p>
                </div>
                {session && (session.user as any).id !== id && (
                  <button onClick={handleFollow} className={following ? "btn-secondary" : "btn-primary"}>
                    {following ? "Following" : "Follow"}
                  </button>
                )}
              </div>
              <div className="flex items-center gap-6 mt-4 text-sm">
                <span><strong>{followData?.followerCount || 0}</strong> followers</span>
                <span><strong>{followData?.followingCount || 0}</strong> following</span>
                <span><strong>{products.length}</strong> products</span>
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-xl font-bold mb-6">Products</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(p => (
            <Link key={p.id} href={`/products/${p.id}`} className="card hover:shadow-md transition-shadow">
              <div className="aspect-video bg-gradient-to-br from-brand-100 to-blue-100 rounded-lg mb-4 flex items-center justify-center text-4xl">📦</div>
              <h3 className="font-semibold">{p.title}</h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{p.description}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-lg font-bold text-brand-700">{formatCurrency(p.price)}</span>
                <span className="text-xs text-gray-400">{p.salesCount} sold</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
