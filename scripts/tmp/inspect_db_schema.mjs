import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing Supabase env vars.");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

async function probe(label, queryFn) {
  try {
    const { data, error } = await queryFn();
    if (error) {
      console.log(`[FAIL] ${label}: ${error.message}`);
      return;
    }
    console.log(`[PASS] ${label}`);
    if (Array.isArray(data) && data.length > 0) {
      console.log(`  keys: ${Object.keys(data[0]).join(", ")}`);
    } else {
      console.log("  no rows");
    }
  } catch (error) {
    console.log(`[FAIL] ${label}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

await probe("profiles select id,user_id", () =>
  supabase.from("profiles").select("id,user_id,role").limit(1)
);

await probe("profiles select id,role", () =>
  supabase.from("profiles").select("id,role").limit(1)
);

await probe("requests select id,student_id,assigned_mentor", () =>
  supabase.from("requests").select("id,student_id,assigned_mentor,status").limit(1)
);

await probe("mentor_applications select user_id,status", () =>
  supabase.from("mentor_applications").select("id,user_id,status").limit(1)
);

await probe("notifications select user_id,type", () =>
  supabase.from("notifications").select("id,user_id,type").limit(1)
);
