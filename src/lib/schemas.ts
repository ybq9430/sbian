import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1).max(100),
});

export const productSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  price: z.number().min(0).max(999999),
  category: z.string().min(1),
  coverImage: z.string().optional(),
  fileUrl: z.string().optional(),
  status: z.string().optional(),
  tags: z.string().optional(),
});

export const orderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().min(1),
    price: z.number().positive(),
    quantity: z.number().int().positive().default(1),
  })).min(1),
});

export const discussionSchema = z.object({
  productId: z.string().min(1),
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(5000),
});

export const replySchema = z.object({
  body: z.string().min(1).max(2000),
  parentId: z.string().optional(),
});

export const emailSchema = z.object({
  subject: z.string().min(1).max(200),
  content: z.string().min(1).max(10000),
  productId: z.string().optional(),
});

export const affiliateSchema = z.object({
  productId: z.string().min(1),
});

export const followSchema = z.object({
  followingId: z.string().min(1),
});

export const boostSchema = z.object({
  productId: z.string().min(1),
});

export const apiKeySchema = z.object({
  name: z.string().min(1).max(100),
  scopes: z.string().optional(),
});

export const webhookSchema = z.object({
  url: z.string().url(),
  events: z.string().optional(),
});

export const teamSchema = z.object({
  productId: z.string().min(1),
  email: z.string().email(),
  role: z.string().optional(),
});

export const licenseGenSchema = z.object({
  productId: z.string().min(1),
  count: z.number().int().min(1).max(100).optional(),
});

export const subscriptionSchema = z.object({
  productId: z.string().min(1),
  interval: z.string().optional(),
  intervalCount: z.number().int().positive().optional(),
  trialDays: z.number().int().min(0).optional(),
});

export const abTestSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1),
  traffic: z.number().min(0.1).max(0.9).optional(),
  variants: z.array(z.object({
    name: z.string().min(1),
    title: z.string().optional(),
    description: z.string().optional(),
    price: z.number().optional(),
    coverImage: z.string().optional(),
  })).min(2).max(5),
});

export const gamificationSchema = z.object({
  action: z.string().min(1),
});

export const conversionEventSchema = z.object({
  productId: z.string().min(1),
  event: z.string().min(1),
  source: z.string().optional(),
  value: z.number().optional(),
});

export const crmNoteSchema = z.object({
  type: z.enum(["note", "segment"]),
  userId: z.string().optional().default(""),
  note: z.string().optional().default(""),
  name: z.string().optional().default(""),
  criteria: z.any().optional(),
});

export const storefrontSchema = z.object({
  subdomain: z.string().min(3).max(30).regex(/^[a-z0-9-]+$/),
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  theme: z.string().optional(),
  logoUrl: z.string().optional(),
});

export const deleteIdSchema = z.object({
  id: z.string().min(1),
});

export const aIDescribeSchema = z.object({
  title: z.string().min(1).max(200),
  category: z.string().min(1),
  keywords: z.string().optional(),
});
