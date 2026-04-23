import { createClient } from "@supabase/supabase-js";

let browserClient: ReturnType<typeof createClient> | null = null;

const SUPABASE_ENV_SETUP_HINT =
  "Create .env.local from .env.local.example and restart the dev server.";

export function getSupabaseBrowserConfigError() {
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

export function hasSupabaseBrowserConfig() {
  return getSupabaseBrowserConfigError() === null;
}

export function getSupabaseBrowserClient() {
  if (browserClient) {
    return browserClient;
  }

  const configError = getSupabaseBrowserConfigError();
  if (configError) {
    throw new Error(configError);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

  browserClient = createClient(url, anonKey);
  return browserClient;
}
