/**
 * profileController.ts
 * Business logic layer between API routes and profileService.
 * Validates inputs with Zod before touching the DB.
 */
import { profileSchema } from '../models/schemas'
import {
  upsertProfile,
  getProfileByUserId,
  searchMentors,
  getMentorProfile,
} from '../services/profileService'
import type { DbProfile } from '../models/types'
import type { MentorSearchOptions } from '../services/profileService'

// ─── Create / update profile ──────────────────────────────────

/**
 * Validates and upserts a profile.
 * The user_id is always injected from the auth middleware — never trusted from body.
 */
export async function createOrUpdateProfile(
  user_id: string,
  payload: unknown
): Promise<DbProfile> {
  // Inject user_id so Zod sees it, then validate
  const validated = profileSchema.parse({ ...(payload as object), user_id })
  return upsertProfile(validated as any)
}

// ─── Fetch own profile ────────────────────────────────────────

export async function fetchProfile(user_id: string): Promise<DbProfile | null> {
  return getProfileByUserId(user_id)
}

// ─── Mentor search ────────────────────────────────────────────

export async function findMentors(options: MentorSearchOptions): Promise<DbProfile[]> {
  return searchMentors(options)
}

export async function fetchMentorDetail(mentor_user_id: string): Promise<DbProfile | null> {
  return getMentorProfile(mentor_user_id)
}
