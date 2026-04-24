import { NextResponse } from "next/server";
import supabaseServer from "@/backend/config/supabaseServer";
import {
  getSupabaseServerConfigError,
  isSupabaseServerConfigured,
} from "@/lib/supabase/admin";

const CORE_TABLES = [
  "profiles",
  "mentor_applications",
  "requests",
  "ratings",
  "notifications",
  "otps",
] as const;

const OPTIONAL_TABLES = ["mentor_blogs"] as const;

type TableResult = {
  ok: boolean;
  error?: string;
};

export async function GET() {
  if (!isSupabaseServerConfigured()) {
    const configError = getSupabaseServerConfigError();

    return NextResponse.json({
      ok: true,
      mode: "offline",
      checks: {},
      optional: {
        missing: [...OPTIONAL_TABLES],
      },
      hint:
        configError?.message ??
        "Supabase is not configured. IdeaBridge is running in offline demo mode.",
    });
  }

  const checks: Record<string, TableResult> = {};

  const tablesToCheck = [...CORE_TABLES, ...OPTIONAL_TABLES];

  await Promise.all(
    tablesToCheck.map(async (table) => {
      const { error } = await supabaseServer
        .from(table)
        .select("*")
        .limit(1);

      checks[table] = error
        ? { ok: false, error: error.message }
        : { ok: true };
    })
  );

  const allOk = CORE_TABLES.every((table) => checks[table]?.ok);

  const missingOptional = OPTIONAL_TABLES.filter((table) => !checks[table]?.ok);

  return NextResponse.json(
    {
      ok: allOk,
      checks,
      optional: {
        missing: missingOptional,
      },
      hint: allOk
        ? missingOptional.length > 0
          ? "Core backend tables are reachable. Optional mentor_blogs is missing; blog API uses posts fallback."
          : "Database connection and core backend tables are reachable."
        : "Run supabase/unified_migration.sql in Supabase SQL Editor for missing tables/policies.",
    },
    { status: allOk ? 200 : 500 }
  );
}
