const DEFAULT_ADMIN_EMAILS = ["it23741478@my.sliit.lk"] as const;

function parseAllowList(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

const adminEmailAllowList = new Set<string>([
  ...DEFAULT_ADMIN_EMAILS,
  ...parseAllowList(process.env.NEXT_PUBLIC_ADMIN_EMAIL_ALLOWLIST),
]);

export function isAdminEmail(email: string | null | undefined) {
  if (!email) return false;
  return adminEmailAllowList.has(email.trim().toLowerCase());
}

