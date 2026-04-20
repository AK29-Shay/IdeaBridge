"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LogoutPage() {
  const router = useRouter();

  React.useEffect(() => {
    let isActive = true;

    async function signOut() {
      const supabase = getSupabaseBrowserClient();

      try {
        await supabase.auth.signOut();
      } finally {
        if (isActive) {
          router.replace("/login");
        }
      }
    }

    void signOut();

    return () => {
      isActive = false;
    };
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FFF8F3] px-4 text-center">
      <div className="rounded-2xl border border-[#FFCBA4]/40 bg-white px-6 py-5 shadow-lg">
        <p className="text-sm font-medium text-[#0F0F0F]/70">Signing you out...</p>
      </div>
    </div>
  );
}
