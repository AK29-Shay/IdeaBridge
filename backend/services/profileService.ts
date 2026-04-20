import supabaseServer from '../config/supabaseServer'
import { Profile } from '../models/schemas'

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
  if (error) throw error
  return data?.[0] ?? null
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

export async function listMentorProfiles(options?: {
  search?: string
  skill?: string
  availability?: string
  limit?: number
}) {
  const limit = options?.limit && options.limit > 0 ? Math.min(options.limit, 50) : 24
  let query = supabaseServer
    .from('profiles')
    .select(
      'id,full_name,avatar_url,bio,skills,availability,availability_status,years_experience,linked_in,github_url,portfolio_links,availability_calendar_note,reputation,role'
    )
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
  if (error) throw error
  return data ?? []
}

export async function getMentorProfileById(mentorId: string) {
  const { data, error } = await supabaseServer
    .from('profiles')
    .select(
      'id,full_name,avatar_url,bio,skills,availability,availability_status,years_experience,linked_in,github_url,portfolio_links,availability_calendar_note,reputation,role'
    )
    .eq('id', mentorId)
    .in('role', ['Mentor', 'mentor'])
    .maybeSingle()

  if (error) throw error
  return data
}
