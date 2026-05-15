import type { Metadata } from "next";
import prisma from "@/lib/prisma";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const creator = await prisma.user.findUnique({
    where: { id: params.id },
    select: { name: true, bio: true },
  });
  if (!creator) return { title: "Creator not found - Shelf" };
  return {
    title: `${creator.name} - Shelf`,
    description: creator.bio || `View ${creator.name}'s profile and products on Shelf`,
  };
}

export default function CreatorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
