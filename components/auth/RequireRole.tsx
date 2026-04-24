"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { UserRole } from "@/types/auth";

import { useAuth } from "@/context/AuthContext";
import { RequireAuth } from "@/components/auth/RequireAuth";

export function RequireRole({
  role,
  children,
}: {
  role: UserRole;
  children: React.ReactNode;
}) {
  const { user, isReady } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!isReady || !user) return;
    if (user.role !== role) {
      if (user.role === "student") {
        router.push("/dashboard/student");
      } else if (user.role === "mentor") {
        router.push("/dashboard/mentor");
      } else {
        router.push("/dashboard/admin");
      }
    }
  }, [isReady, user, router, role]);

  if (!isReady) return <div className="mx-auto max-w-6xl px-4 py-10" />;
  if (!user) return null;
  if (user.role !== role) return null;
  return <>{children}</>;
}

// Compose for convenience.
export function RequireRoleAuth({ role, children }: { role: UserRole; children: React.ReactNode }) {
  return (
    <RequireAuth>
      <RequireRole role={role}>{children}</RequireRole>
    </RequireAuth>
  );
}

