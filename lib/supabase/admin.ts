import { createClient } from "@supabase/supabase-js";

const SUPABASE_ENV_SETUP_HINT =
  "Create .env.local from .env.local.example and restart the dev server.";

type SupabaseAdminClient = ReturnType<typeof createClient>;

let adminClient: SupabaseAdminClient | null = null;

function getSupabaseAdminConfigError() {
  const missing: string[] = [];

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    missing.push("NEXT_PUBLIC_SUPABASE_URL");
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    missing.push("SUPABASE_SERVICE_ROLE_KEY");
  }

  if (missing.length === 0) {
    return null;
  }

  return `Missing required environment variable${
    missing.length === 1 ? "" : "s"
  }: ${missing.join(", ")}. ${SUPABASE_ENV_SETUP_HINT}`;
}

export function getSupabaseAdminClient() {
  if (adminClient) {
    return adminClient;
  }

  const configError = getSupabaseAdminConfigError();
  if (configError) {
    throw new Error(configError);
  }

  adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    }
  );

  return adminClient;
}

// Defer env validation until the client is actually used so routes can fail gracefully.
export const supabaseAdmin = new Proxy({} as SupabaseAdminClient, {
  get(_target, prop) {
    const client = getSupabaseAdminClient();
    const value = Reflect.get(client, prop, client);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

export default supabaseAdmin;
