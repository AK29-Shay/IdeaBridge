import { createClient } from "@supabase/supabase-js";

let browserClient: ReturnType<typeof createClient> | null = null;
const SUPABASE_CONFIG_ERROR_PREFIX = "Supabase is not configured.";

function isPlaceholderValue(value: string) {
  return (
    value.includes("your-project-ref.supabase.co") ||
    value.includes("your-anon-key-here") ||
    value.includes("your-service-role-key-here")
  );
}

function getRequiredEnv(name: string, value: string | undefined) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  if (isPlaceholderValue(value)) {
    throw new Error(
      `Supabase is not configured. Replace the placeholder value for ${name} in .env.local.`
    );
  }

  if (name === "NEXT_PUBLIC_SUPABASE_URL") {
    try {
      const parsed = new URL(value);
      if (!parsed.protocol.startsWith("http")) {
        throw new Error("Invalid protocol");
      }
    } catch {
      throw new Error(`Invalid Supabase URL in ${name}.`);
    }
  }

  return value;
}

export function getSupabaseBrowserConfigError() {
  try {
    getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);
    getRequiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    return null;
  } catch (error) {
    return error instanceof Error ? error : new Error("Supabase browser config is invalid.");
  }
}

export function hasSupabaseBrowserConfig() {
  return getSupabaseBrowserConfigError() === null;
}

export function getSupabaseBrowserClientOrNull() {
  const configError = getSupabaseBrowserConfigError();
  if (configError) {
    return null;
  }

  return getSupabaseBrowserClient();
}

export function isSupabaseConfigurationError(error: unknown): error is Error {
  return error instanceof Error && error.message.startsWith(SUPABASE_CONFIG_ERROR_PREFIX);
}

export function getSupabaseBrowserClient() {
  if (browserClient) {
    return browserClient;
  }

  const url = getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);
  const anonKey = getRequiredEnv(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  browserClient = createClient(url, anonKey);
  return browserClient;
}
