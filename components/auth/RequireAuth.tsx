"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

export function RequireAuth({
  children,
  redirectTo = "/login",
}: {
  children: React.ReactNode;
  redirectTo?: string;
}) {
  const { user, isReady } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!isReady) return;
    if (!user) {
      router.push(redirectTo);
    }
  }, [isReady, user, router, redirectTo]);

  if (!isReady) {
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

  if (!user) return null;
  return <>{children}</>;
}

