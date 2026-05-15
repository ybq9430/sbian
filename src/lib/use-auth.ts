"use client";
import { useSession } from "next-auth/react";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export function useAuth() {
  const { data: session, status } = useSession();
  const user = session?.user as AuthUser | undefined;
  return {
    user: user ?? null,
    status,
    isAuthenticated: status === "authenticated" && !!user,
    isAdmin: user?.role === "admin",
    isLoading: status === "loading",
  };
}
