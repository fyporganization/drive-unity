'use client'
import { useSession } from "@/app/providers/SessionProvider";
import { useRouter } from "next/router";
import { useEffect } from "react";

export function useRequireAuth() {
  const { user, loading } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);
  
  return { user, loading };
}