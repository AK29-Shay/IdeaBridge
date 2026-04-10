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
