"use client";

import { getSupabaseBrowserClient, hasSupabaseBrowserConfig } from "@/lib/supabase/client";

export async function authFetch(input: RequestInfo | URL, init?: RequestInit) {
  const headers = new Headers(init?.headers ?? {});

  if (hasSupabaseBrowserConfig()) {
    const supabase = getSupabaseBrowserClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.access_token) {
      headers.set("authorization", `Bearer ${session.access_token}`);
    }
  }

  return fetch(input, {
    ...init,
    headers,
  });
}
