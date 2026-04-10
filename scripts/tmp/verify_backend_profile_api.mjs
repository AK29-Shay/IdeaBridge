import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadEnvFromFile(path) {
  const content = fs.readFileSync(path, "utf8");
  for (const line of content.split(/\r?\n/)) {
    if (!line || line.trim().startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx < 0) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvFromFile(".env.local");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !anonKey || !serviceKey) {
  throw new Error("Missing required env vars for Supabase test");
}

const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
const client = createClient(supabaseUrl, anonKey, { auth: { persistSession: false } });

const email = `apitest_${Date.now()}@example.com`;
const password = "Demo@1234!";

let userId = null;

try {
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (createError) throw createError;
  userId = created.user?.id;

  const { data: signedIn, error: signInError } = await client.auth.signInWithPassword({ email, password });
  if (signInError) throw signInError;

  const token = signedIn.session?.access_token;
  if (!token) throw new Error("Missing access token");

  const payload = {
    full_name: "API Test User",
    bio: "Testing backend profile route and Supabase persistence.",
    skills: ["Next.js", "Supabase"],
    availability: "Part-time",
    role: "Student",
  };

  const postResp = await fetch("http://localhost:3000/api/profile", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const postJson = await postResp.json();
  console.log(`[POST /api/profile] status=${postResp.status}`);
  console.log(postJson);

  const getResp = await fetch("http://localhost:3000/api/profile", {
    method: "GET",
    headers: { authorization: `Bearer ${token}` },
  });

  const getJson = await getResp.json();
  console.log(`[GET /api/profile] status=${getResp.status}`);
  console.log(getJson);

  if (!postResp.ok || !getResp.ok) {
    process.exitCode = 1;
  }
} finally {
  if (userId) {
    await admin.auth.admin.deleteUser(userId);
  }
}
