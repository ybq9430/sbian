// Shared API response types for frontend type safety

export interface ProductData {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  coverImage: string | null;
  status: string;
  salesCount: number;
  revenue: number;
  rating: number;
  tags: string;
  createdAt: string;
  sellerId: string;
  seller?: { id: string; name: string; avatar: string | null };
  reviews?: ReviewData[];
}

export interface ReviewData {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user?: { id: string; name: string; avatar: string | null };
}

export interface OrderData {
  id: string;
  buyerId: string;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItemData[];
}

export interface OrderItemData {
  id: string;
  productId: string;
  price: number;
  quantity: number;
  product?: ProductData;
}

export interface ActivityItem {
  type: "purchase" | "new_product" | "review" | "follow";
  date: string;
  user?: { id: string; name: string };
  product?: { id: string; title: string };
  seller?: { id: string; name: string };
  follower?: { id: string; name: string };
  following?: { id: string; name: string };
  price?: number;
  rating?: number;
  comment?: string | null;
}

export interface AnalyticsData {
  myProducts?: number;
  myOrders?: number;
  totalRevenue?: number;
  totalSales?: number;
  walletBalance?: number;
  // admin fields
  totalUsers?: number;
  totalProducts?: number;
  totalOrders?: number;
  recentOrders?: OrderData[];
  monthlyOrders?: { total: number; createdAt: string }[];
}

export interface SearchResults {
  products: ProductData[];
  total: number;
  facets: {
    categories: string[];
    tags: string[];
    priceRange: { min: number; max: number };
  };
  query: string;
}

export interface WalletData {
  id: string;
  userId: string;
  balance: number;
}

export interface AffiliateData {
  id: string;
  code: string;
  commission: number;
  earnings: number;
  clickCount: number;
  conversionCount: number;
}

export interface FlashDealData {
  id: string;
  productId: string;
  salePrice: number;
  maxSales: number;
  soldCount: number;
  startsAt: string;
  endsAt: string;
  active: boolean;
  product?: ProductData;
}

export interface BundleData {
  id: string;
  title: string;
  description: string;
  price: number;
  discount: number;
  originalPrice?: number;
  savings?: number;
  items?: { product: ProductData }[];
}

export interface NotificationData {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  link: string | null;
  createdAt: string;
}

export interface LicenseKeyData {
  id: string;
  key: string;
  productId: string;
  status: string;
  product?: { title: string };
  createdAt: string;
}

export interface ApiKeyData {
  id: string;
  name: string;
  key: string;
  scopes: string;
  active: boolean;
  lastUsed: string | null;
  createdAt: string;
}

export interface WebhookData {
  id: string;
  url: string;
  events: string;
  active: boolean;
  createdAt: string;
}

export interface DiscussionData {
  id: string;
  title: string;
  body: string;
  userId: string;
  productId: string;
  createdAt: string;
  user?: { id: string; name: string; avatar: string | null };
  replies?: ReplyData[];
}

export interface ReplyData {
  id: string;
  body: string;
  userId: string;
  createdAt: string;
  user?: { id: string; name: string; avatar: string | null };
  children?: ReplyData[];
}

export interface ABTestData {
  id: string;
  productId: string;
  name: string;
  status: string;
  traffic: number;
  variants: ABTestVariantData[];
  createdAt: string;
}

export interface ABTestVariantData {
  id: string;
  name: string;
  title: string | null;
  description: string | null;
  price: number | null;
  impressions: number;
  conversions: number;
}

export interface FunnelData {
  funnel: { stage: string; count: number; pct: number }[];
  sources: Record<string, number>;
  totalViews: number;
  totalConversions: number;
  conversionRate: string;
}

export interface TeamMemberData {
  id: string;
  userId: string;
  productId: string;
  role: string;
  user?: { id: string; name: string; email: string; avatar: string | null };
  product?: { id: string; title: string; salesCount: number; revenue: number };
}

export interface SubscriptionData {
  id: string;
  userId: string;
  status: string;
  currentStart: string;
  currentEnd: string;
  plan?: { id: string; interval: string; intervalCount: number; product?: ProductData };
}

export interface PaginatedResponse<T> {
  page: number;
  hasMore: boolean;
  activities?: T[];
  products?: T[];
}

export function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "An unexpected error occurred";
}
