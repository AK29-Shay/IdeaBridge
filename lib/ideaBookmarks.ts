const IDEA_BOOKMARKS_KEY = "ideabridge_saved_ideas_v1";

type BookmarkStore = Record<string, string[]>;

function safeParse(raw: string | null): BookmarkStore {
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw) as BookmarkStore;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function normalizeEmail(email?: string) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

function readStore() {
  if (typeof window === "undefined") return {};
  return safeParse(window.localStorage.getItem(IDEA_BOOKMARKS_KEY));
}

function writeStore(store: BookmarkStore) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(IDEA_BOOKMARKS_KEY, JSON.stringify(store));
}

export function getSavedIdeaIds(email?: string) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return [];

  const store = readStore();
  return Array.isArray(store[normalizedEmail]) ? store[normalizedEmail] : [];
}

export function setSavedIdeaIds(email: string | undefined, nextIds: string[]) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return [];

  const uniqueIds = Array.from(new Set(nextIds.filter(Boolean)));
  const store = readStore();
  store[normalizedEmail] = uniqueIds;
  writeStore(store);
  return uniqueIds;
}

export function toggleSavedIdeaId(email: string | undefined, ideaId: string) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || !ideaId) return [];

  const current = getSavedIdeaIds(normalizedEmail);
  const next = current.includes(ideaId)
    ? current.filter((id) => id !== ideaId)
    : [ideaId, ...current];

  return setSavedIdeaIds(normalizedEmail, next);
}
