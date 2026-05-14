import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@shelf.io" },
    update: {},
    create: { email: "admin@shelf.io", name: "Admin", passwordHash: hash, role: "admin", xp: 2500, level: 6, bio: "Platform administrator and top seller", website: "https://shelf.io" },
  });
  const seller = await prisma.user.upsert({
    where: { email: "seller@shelf.io" },
    update: {},
    create: { email: "seller@shelf.io", name: "Alice Creator", passwordHash: hash, xp: 1800, level: 4, bio: "Full-stack developer & educator. Building the future of digital products.", website: "https://alice.dev" },
  });
  const buyer = await prisma.user.upsert({
    where: { email: "buyer@shelf.io" },
    update: {},
    create: { email: "buyer@shelf.io", name: "Bob Buyer", passwordHash: hash, xp: 300, level: 1, bio: "Learning and growing every day.", website: "" },
  });

  await prisma.wallet.upsert({ where: { userId: admin.id }, update: {}, create: { userId: admin.id, balance: 10000 } });
  await prisma.wallet.upsert({ where: { userId: seller.id }, update: {}, create: { userId: seller.id, balance: 5000 } });
  await prisma.wallet.upsert({ where: { userId: buyer.id }, update: {}, create: { userId: buyer.id, balance: 500 } });

  const products = [
    { title: "React Masterclass 2024", description: "Complete guide to React 19 with Server Components, hooks, and advanced patterns. 20+ hours of video content.", price: 299, category: "Course", sellerId: seller.id, status: "published", salesCount: 156, revenue: 46644, rating: 4.8, tags: "react, frontend, javascript, web-development" },
    { title: "Ultimate TypeScript Handbook", description: "Deep dive into TypeScript's type system. Generics, conditional types, template literals, and more.", price: 149, category: "E-book", sellerId: seller.id, status: "published", salesCount: 89, revenue: 13261, rating: 4.6, tags: "typescript, javascript, programming, e-book" },
    { title: "SaaS Landing Page Kit", description: "10 premium landing page templates built with Next.js and Tailwind CSS. Fully responsive and SEO optimized.", price: 199, category: "Template", sellerId: seller.id, status: "published", salesCount: 234, revenue: 46566, rating: 4.9, tags: "saas, landing-page, template, nextjs, tailwind" },
    { title: "AI Prompt Engineering Guide", description: "Master the art of prompt engineering for GPT-4, Claude, and other LLMs. Includes 500+ templates.", price: 79, category: "E-book", sellerId: seller.id, status: "published", salesCount: 312, revenue: 24648, rating: 4.5, tags: "ai, prompt-engineering, llm, e-book" },
    { title: "Minimal Icon Pack", description: "2000+ beautifully crafted SVG icons for web and mobile apps. Multiple styles and sizes.", price: 49, category: "Design", sellerId: seller.id, status: "published", salesCount: 567, revenue: 27783, rating: 4.7, tags: "icons, svg, design, ui" },
    { title: "Node.js API Starter", description: "Production-ready Node.js backend with Express, Prisma, authentication, and testing setup.", price: 249, category: "Software", sellerId: seller.id, status: "published", salesCount: 98, revenue: 24402, rating: 4.4, tags: "nodejs, api, backend, starter-kit" },
    { title: "Notion Productivity System", description: "All-in-one Notion workspace for freelancers and small teams. Track projects, tasks, and goals.", price: 39, category: "Template", sellerId: admin.id, status: "published", salesCount: 1023, revenue: 39897, rating: 4.9, tags: "notion, productivity, template, organization" },
    { title: "Motion Design Course", description: "Learn animation principles and create stunning motion graphics. Includes After Effects project files.", price: 399, category: "Course", sellerId: admin.id, status: "published", salesCount: 67, revenue: 26733, rating: 4.3, tags: "motion-design, animation, after-effects, course" },
    { title: "Stock Photo Collection Vol.1", description: "500 high-resolution stock photos for commercial use. Nature, city, people, and abstract themes.", price: 29, category: "Design", sellerId: admin.id, status: "published", salesCount: 2045, revenue: 59305, rating: 4.6, tags: "stock-photos, photography, design, commercial-use" },
    { title: "Email Marketing Playbook", description: "Proven email sequences that convert. Includes templates, A/B testing framework, and analytics setup.", price: 89, category: "E-book", sellerId: admin.id, status: "published", salesCount: 178, revenue: 15842, rating: 4.2, tags: "email-marketing, conversion, templates, e-book" },
  ];

  const productIds: Record<string, string> = {};
  for (const p of products) {
    const id = `seed-${p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    productIds[p.title] = id;
    await prisma.product.upsert({ where: { id }, update: p, create: { id, ...p } });
  }

  // Badges
  const badges = [
    { name: "First Sale", description: "Make your first sale", icon: "💰", criteria: "sales>=1", xpReward: 100 },
    { name: "Rising Star", description: "Reach 10 sales", icon: "⭐", criteria: "sales>=10", xpReward: 250 },
    { name: "Best Seller", description: "Reach 100 sales", icon: "🏆", criteria: "sales>=100", xpReward: 500 },
    { name: "Millionaire", description: "Earn ¥10,000 in revenue", icon: "💎", criteria: "revenue>=10000", xpReward: 1000 },
    { name: "Product Creator", description: "Publish your first product", icon: "🚀", criteria: "products>=1", xpReward: 150 },
    { name: "Portfolio Builder", description: "Publish 5 products", icon: "📚", criteria: "products>=5", xpReward: 400 },
    { name: "Influencer", description: "Get 50 followers", icon: "🌟", criteria: "followers>=50", xpReward: 300 },
    { name: "Veteran", description: "Active for 30 days", icon: "🎖️", criteria: "days>=30", xpReward: 200 },
  ];

  for (const b of badges) {
    await prisma.badge.upsert({
      where: { name: b.name },
      update: b,
      create: b,
    });
  }

  // Flash deal
  const now = new Date();
  const dealEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  await prisma.flashDeal.create({
    data: {
      productId: productIds["AI Prompt Engineering Guide"],
      salePrice: 39,
      maxSales: 100,
      soldCount: 34,
      startsAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      endsAt: dealEnd,
    },
  });

  // Flash deal for stock photos
  await prisma.flashDeal.create({
    data: {
      productId: productIds["Stock Photo Collection Vol.1"],
      salePrice: 9,
      maxSales: 200,
      soldCount: 87,
      startsAt: new Date(now.getTime() - 5 * 60 * 60 * 1000),
      endsAt: new Date(now.getTime() + 12 * 60 * 60 * 1000),
    },
  });

  // Bundle
  const bundle = await prisma.bundle.create({
    data: {
      title: "Web Developer Bundle",
      description: "Everything you need to master modern web development. Three products at a special price.",
      price: 499,
      discount: 0.22,
      sellerId: seller.id,
    },
  });
  for (const title of ["React Masterclass 2024", "Ultimate TypeScript Handbook", "Node.js API Starter"]) {
    await prisma.bundleItem.create({ data: { bundleId: bundle.id, productId: productIds[title] } });
  }

  // Follow relationships
  await prisma.follow.upsert({ where: { followerId_followingId: { followerId: buyer.id, followingId: seller.id } }, update: {}, create: { followerId: buyer.id, followingId: seller.id } });
  await prisma.follow.upsert({ where: { followerId_followingId: { followerId: buyer.id, followingId: admin.id } }, update: {}, create: { followerId: buyer.id, followingId: admin.id } });
  await prisma.follow.upsert({ where: { followerId_followingId: { followerId: seller.id, followingId: admin.id } }, update: {}, create: { followerId: seller.id, followingId: admin.id } });

  // Notifications
  await prisma.notification.createMany({
    data: [
      { userId: seller.id, type: "sale", title: "New sale!", body: "Someone just purchased 'AI Prompt Engineering Guide' for ¥79", read: false },
      { userId: seller.id, type: "follow", title: "New follower", body: "Bob Buyer started following you", read: false, link: `/creator/${buyer.id}` },
      { userId: admin.id, type: "sale", title: "Flash deal going strong", body: "Your 'Stock Photo Collection' flash deal has 87 sales! 113 remaining.", read: false },
    ],
  });

  // Affiliate for seller
  await prisma.affiliate.upsert({
    where: { userId: seller.id },
    update: {},
    create: { userId: seller.id, code: "ALICE-X2K9", commission: 0.15, earnings: 1230, clickCount: 342, conversionCount: 28 },
  });

  console.log("Database seeded successfully with innovative features!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
