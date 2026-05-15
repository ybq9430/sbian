import type { Metadata } from "next";
import prisma from "@/lib/prisma";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    select: { title: true, description: true, coverImage: true },
  });
  if (!product) return { title: "Product not found - Shelf" };
  return {
    title: `${product.title} - Shelf`,
    description: product.description.slice(0, 160),
    openGraph: {
      title: product.title,
      description: product.description.slice(0, 160),
      type: "website",
    },
  };
}

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return children;
}
