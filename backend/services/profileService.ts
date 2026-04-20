import supabaseServer from '../config/supabaseServer'
import { Profile } from '../models/schemas'
import { isLegacyProfilesSchemaError } from '@/lib/profileMapper'

const FULL_MENTOR_SELECT =
  'id,full_name,avatar_url,bio,skills,availability,availability_status,years_experience,linked_in,github_url,portfolio_links,availability_calendar_note,reputation,role'

const LEGACY_MENTOR_SELECT = 'id,full_name,avatar_url,bio,skills,availability,role'

type MentorProfileRow = {
  id: string
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  skills: string[] | null
  availability: string | null
  availability_status?: string | null
  years_experience?: number | null
  linked_in?: string | null
  github_url?: string | null
  portfolio_links?: string[] | null
  availability_calendar_note?: string | null
  reputation?: number | null
  role?: string | null
}

function normalizeRole(role?: string) {
  if (!role) return role
  const lower = role.toLowerCase()
  if (lower === 'student') return 'Student'
  if (lower === 'mentor') return 'Mentor'
  if (lower === 'admin') return 'Admin'
  return role
}

export async function upsertProfile(profile: Partial<Profile>) {
  const payload = {
    ...profile,
    role: normalizeRole(profile.role),
  }

  const { data, error } = await supabaseServer
    .from('profiles')
    .upsert(payload, { onConflict: 'id' })
    .select()
  if (!error) return data?.[0] ?? null

  if (!isLegacyProfilesSchemaError(error.message)) throw error

  const legacyPayload = {
    id: payload.id,
    full_name: payload.full_name,
    avatar_url: payload.avatar_url,
    bio: payload.bio,
    skills: payload.skills,
    availability: payload.availability,
    role: payload.role,
  }

  const { data: legacyData, error: legacyError } = await supabaseServer
    .from('profiles')
    .upsert(legacyPayload, { onConflict: 'id' })
    .select()

  if (legacyError) throw legacyError
  return legacyData?.[0] ?? null
}

export async function getProfileByUserId(user_id: string) {
  const { data, error } = await supabaseServer.from('profiles').select('*').eq('id', user_id).maybeSingle()
  if (error) throw error
  return data
}

export async function searchMentorsBySkill(skill: string, limit = 20) {
  const { data, error } = await supabaseServer
    .from('profiles')
    .select('*')
    .contains('skills', [skill])
    .in('role', ['Mentor', 'mentor'])
    .limit(limit)

  if (error) throw error
  return data
}

function mapLegacyMentorRow(row: MentorProfileRow) {
  return {
    id: row.id,
    full_name: row.full_name ?? null,
    avatar_url: row.avatar_url ?? null,
    bio: row.bio ?? null,
    skills: row.skills ?? [],
    availability: row.availability ?? null,
    availability_status: row.availability_status ?? null,
    years_experience: row.years_experience ?? null,
    linked_in: row.linked_in ?? null,
    github_url: row.github_url ?? null,
    portfolio_links: row.portfolio_links ?? [],
    availability_calendar_note: row.availability_calendar_note ?? null,
    reputation: row.reputation ?? null,
    role: row.role ?? null,
  }
}

function isMissingProfilesColumn(error: { message?: string } | null) {
  return Boolean(error?.message && error.message.includes('column profiles.'))
}

export async function listMentorProfiles(options?: {
  search?: string
  skill?: string
  availability?: string
  limit?: number
}) {
  const limit = options?.limit && options.limit > 0 ? Math.min(options.limit, 50) : 24
  let query = supabaseServer
    .from('profiles')
    .select(FULL_MENTOR_SELECT)
    .in('role', ['Mentor', 'mentor'])
    .limit(limit)

  if (options?.skill) {
    query = query.contains('skills', [options.skill])
  }

  if (options?.availability) {
    query = query.eq('availability_status', options.availability)
  }

  if (options?.search) {
    query = query.or(`full_name.ilike.%${options.search}%,bio.ilike.%${options.search}%`)
  }

  const { data, error } = await query.order('reputation', { ascending: false })
  if (!error) {
    return (data ?? []).map((row) => mapLegacyMentorRow(row as MentorProfileRow))
  }

  if (!isMissingProfilesColumn(error)) throw error

  let legacyQuery = supabaseServer
    .from('profiles')
    .select(LEGACY_MENTOR_SELECT)
    .in('role', ['Mentor', 'mentor'])
    .limit(limit)

  if (options?.skill) {
    legacyQuery = legacyQuery.contains('skills', [options.skill])
  }

  if (options?.search) {
    legacyQuery = legacyQuery.or(`full_name.ilike.%${options.search}%,bio.ilike.%${options.search}%`)
  }

  const { data: legacyData, error: legacyError } = await legacyQuery.order('full_name', { ascending: true })
  if (legacyError) throw legacyError

  const mapped = (legacyData ?? []).map((row) => mapLegacyMentorRow(row as MentorProfileRow))
  if (options?.availability) {
    return mapped.filter((row) => row.availability_status === options.availability)
  }

  return mapped
}

export async function getMentorProfileById(mentorId: string) {
  const { data, error } = await supabaseServer
    .from('profiles')
    .select(FULL_MENTOR_SELECT)
    .eq('id', mentorId)
    .in('role', ['Mentor', 'mentor'])
    .maybeSingle()

  if (!error) {
    return data ? mapLegacyMentorRow(data as MentorProfileRow) : null
  }

  if (!isMissingProfilesColumn(error)) throw error

  const { data: legacyData, error: legacyError } = await supabaseServer
    .from('profiles')
    .select(LEGACY_MENTOR_SELECT)
    .eq('id', mentorId)
    .in('role', ['Mentor', 'mentor'])
    .maybeSingle()

  if (legacyError) throw legacyError
  return legacyData ? mapLegacyMentorRow(legacyData as MentorProfileRow) : null
}
