"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { supabaseClient } from "@/backend/config/supabaseClient";



export function RequireAuth({
  children,
  redirectTo = "/login",
}: {
  children: React.ReactNode;
  redirectTo?: string;
}) {
  const [sessionChecked, setSessionChecked] = React.useState(false);
  const [session, setSession] = React.useState<any>(null);
  const router = useRouter();

  React.useEffect(() => {
    async function checkSession() {
      const { data, error } = await supabaseClient.auth.getSession();
      console.log("[RequireAuth] supabase.auth.getSession() response:", { data, error });
      setSession(data?.session ?? null);
      setSessionChecked(true);
    }
    checkSession();
  }, []);

  React.useEffect(() => {
    if (!sessionChecked) return;
    if (!session) {
      router.push(redirectTo);
    }
  }, [sessionChecked, session, router, redirectTo]);

  if (!sessionChecked) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <Skeleton className="h-8 w-48" />
        <div className="mt-6 space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  if (!session) return null;
  return <>{children}</>;
}

