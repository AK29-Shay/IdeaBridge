/**
 * profileService.ts
 * Database operations for profiles (student & mentor).
 */
import supabaseServer from '../config/supabaseServer'
import type { DbProfile } from '../models/types'

// ─── Upsert / create ──────────────────────────────────────────

/**
 * Creates or updates a user's profile.
 * Uses user_id as the conflict target (each user has one profile).
 */
export async function upsertProfile(
  profile: Partial<DbProfile> & { user_id: string }
): Promise<DbProfile> {
  const { data, error } = await supabaseServer
    .from('profiles')
    .upsert(profile, { onConflict: 'user_id' })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

// ─── Read ─────────────────────────────────────────────────────

/** Fetch a user's own profile by their auth user_id */
export async function getProfileByUserId(user_id: string): Promise<DbProfile | null> {
  const { data, error } = await supabaseServer
    .from('profiles')
    .select('*')
    .eq('user_id', user_id)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data
}

// ─── Mentor search ────────────────────────────────────────────

export interface MentorSearchOptions {
  skills?: string[]           // filter mentors who have ALL listed skills
  availability?: string
  availability_status?: string
  min_rating?: number
  limit?: number
  offset?: number
}

/**
 * Returns mentor profiles matching the given search filters.
 * Uses the mentor_profiles view defined in SQL (role = 'mentor').
 */
export async function searchMentors(options: MentorSearchOptions): Promise<DbProfile[]> {
  const {
    skills,
    availability,
    availability_status,
    min_rating,
    limit = 20,
    offset = 0,
  } = options

  let query = supabaseServer
    .from('mentor_profiles') // the SQL view
    .select('*')
    .order('reputation', { ascending: false })
    .range(offset, offset + limit - 1)

  if (skills && skills.length > 0) {
    // overlaps — mentor has at least one of the requested skills
    query = query.overlaps('skills', skills)
  }

  if (availability) {
    query = query.eq('availability', availability)
  }

  if (availability_status) {
    query = query.eq('availability_status', availability_status)
  }

  if (min_rating !== undefined) {
    query = query.gte('reputation', min_rating)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data ?? []
}

/** Fetch a single mentor's public profile */
export async function getMentorProfile(mentor_user_id: string): Promise<DbProfile | null> {
  const { data, error } = await supabaseServer
    .from('profiles')
    .select('*')
    .eq('user_id', mentor_user_id)
    .eq('role', 'mentor')
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data
}
