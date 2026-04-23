import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const SUPABASE_ENV_SETUP_HINT =
  "Create .env.local from .env.local.example and restart the dev server.";

function getSupabaseServerConfigError() {
  const missing: string[] = [];

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    missing.push("NEXT_PUBLIC_SUPABASE_URL");
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  if (missing.length === 0) {
    return null;
  }

  return `Missing required environment variable${
    missing.length === 1 ? "" : "s"
  }: ${missing.join(", ")}. ${SUPABASE_ENV_SETUP_HINT}`;
}

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const configError = getSupabaseServerConfigError();
  if (configError) {
    throw new Error(configError);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

  type CookieToSet = {
    name: string;
    value: string;
    options?: Parameters<typeof cookieStore.set>[2];
  };

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  });
}
