import { createClient } from "@supabase/supabase-js";

const FALLBACK_SUPABASE_URL = "https://placeholder.invalid";
const FALLBACK_SUPABASE_KEY = "placeholder-service-role-key";
const SUPABASE_CONFIG_ERROR_PREFIX = "Supabase is not configured.";

function isPlaceholderValue(value: string) {
  return (
    value.includes("your-project-ref.supabase.co") ||
    value.includes("your-anon-key-here") ||
    value.includes("your-service-role-key-here")
  );
}

function getEnvError(name: string, value: string | undefined) {
  if (!value) {
    return new Error(`Missing required environment variable: ${name}`);
  }

  if (isPlaceholderValue(value)) {
    return new Error(
      `${SUPABASE_CONFIG_ERROR_PREFIX} Replace the placeholder value for ${name} in .env.local.`
    );
  }

  if (name === "NEXT_PUBLIC_SUPABASE_URL") {
    try {
      const parsed = new URL(value);
      if (!parsed.protocol.startsWith("http")) {
        throw new Error("Invalid protocol");
      }
    } catch {
      return new Error(`Invalid Supabase URL in ${name}.`);
    }
  }

  return null;
}

export function getSupabaseServerConfigError() {
  return (
    getEnvError("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL) ??
    getEnvError("SUPABASE_SERVICE_ROLE_KEY", process.env.SUPABASE_SERVICE_ROLE_KEY)
  );
}

export function isSupabaseServerConfigured() {
  return getSupabaseServerConfigError() === null;
}

const supabaseUrl = isSupabaseServerConfigured()
  ? process.env.NEXT_PUBLIC_SUPABASE_URL ?? FALLBACK_SUPABASE_URL
  : FALLBACK_SUPABASE_URL;
const serviceRoleKey = isSupabaseServerConfigured()
  ? process.env.SUPABASE_SERVICE_ROLE_KEY ?? FALLBACK_SUPABASE_KEY
  : FALLBACK_SUPABASE_KEY;

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export default supabaseAdmin;
