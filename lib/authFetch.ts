"use client";

import {
  getSupabaseBrowserClientOrNull,
  getSupabaseBrowserConfigError,
} from "@/lib/supabase/client";

export async function authFetch(input: RequestInfo | URL, init?: RequestInit) {
  const supabase = getSupabaseBrowserClientOrNull();
  if (!supabase) {
    throw new Error(
      getSupabaseBrowserConfigError()?.message ?? "Supabase is not configured."
    );
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers = new Headers(init?.headers ?? {});

  if (session?.access_token) {
    headers.set("authorization", `Bearer ${session.access_token}`);
  }

  return fetch(input, {
    ...init,
    headers,
  });
}
