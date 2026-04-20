import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const envPath = path.resolve(".env.local");

function loadEnvFile(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();

    if (key && value && !process.env[key]) {
      process.env[key] = value;
    }
  }
}

if (!fs.existsSync(envPath)) {
  throw new Error(`Missing .env.local at ${envPath}`);
}

loadEnvFile(envPath);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const demoUsers = [
  {
    email: "student.demo@ideabridge.dev",
    password: "Demo@123",
    fullName: "IdeaBridge Student Demo",
    role: "Student",
    profile: {
      bio: "Student demo account for local walkthroughs.",
      skills: ["React", "TypeScript"],
      study_year: "3rd Year",
      faculty: "Computing",
      specialization: "Software Engineering",
      portfolio_links: ["https://example.com/student-demo"],
    },
  },
  {
    email: "mentor.demo@ideabridge.dev",
    password: "Demo@123",
    fullName: "IdeaBridge Mentor Demo",
    role: "Mentor",
    profile: {
      bio: "Mentor demo account for local walkthroughs.",
      skills: ["Next.js", "System Design"],
      availability: "Part-time",
      availability_status: "Available in 1-2 days",
      years_experience: 6,
      linked_in: "https://linkedin.com/in/ideabridge-mentor-demo",
      github_url: "https://github.com/ideabridge-demo",
      portfolio_links: ["https://example.com/mentor-demo"],
    },
  },
];

async function listAllUsers() {
  const users = [];
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) {
      throw new Error(`Failed to list users: ${error.message}`);
    }

    users.push(...data.users);

    if (data.users.length < 200) {
      break;
    }

    page += 1;
  }

  return users;
}

async function ensureDemoUser(definition, existingUsers) {
  const existing = existingUsers.find(
    (user) => (user.email ?? "").trim().toLowerCase() === definition.email.toLowerCase()
  );

  let userId = existing?.id;

  if (!userId) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: definition.email,
      password: definition.password,
      email_confirm: true,
      user_metadata: {
        full_name: definition.fullName,
        role: definition.role.toLowerCase(),
      },
    });

    if (error || !data.user?.id) {
      throw new Error(`Failed to create ${definition.email}: ${error?.message ?? "unknown error"}`);
    }

    userId = data.user.id;
    console.log(`Created auth user: ${definition.email}`);
  } else {
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      password: definition.password,
      email_confirm: true,
      user_metadata: {
        ...(existing.user_metadata ?? {}),
        full_name: definition.fullName,
        role: definition.role.toLowerCase(),
      },
    });

    if (error) {
      throw new Error(`Failed to update ${definition.email}: ${error.message}`);
    }

    console.log(`Updated auth user: ${definition.email}`);
  }

  const profilePayload = {
    id: userId,
    full_name: definition.fullName,
    role: definition.role,
    ...definition.profile,
  };

  const { error: profileError } = await supabase
    .from("profiles")
    .upsert(profilePayload, { onConflict: "id" });

  if (!profileError) {
    console.log(`Upserted profile: ${definition.email}`);
    return;
  }

  const legacyPayload = {
    id: userId,
    full_name: definition.fullName,
    role: definition.role,
    bio: definition.profile.bio ?? null,
    skills: definition.profile.skills ?? [],
    availability: definition.profile.availability ?? null,
  };

  const { error: legacyProfileError } = await supabase
    .from("profiles")
    .upsert(legacyPayload, { onConflict: "id" });

  if (legacyProfileError) {
    throw new Error(
      `Failed to upsert profile for ${definition.email}: ${legacyProfileError.message}`
    );
  }

  console.log(`Upserted legacy profile: ${definition.email}`);
}

const existingUsers = await listAllUsers();

for (const demoUser of demoUsers) {
  await ensureDemoUser(demoUser, existingUsers);
}

console.log("Demo users are ready.");
