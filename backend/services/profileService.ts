import supabaseServer from '../config/supabaseServer'
import { Profile } from '../models/schemas'

export async function upsertProfile(profile: Partial<Profile>) {
  const { data, error } = await supabaseServer
    .from('profiles')
    .upsert(profile, { onConflict: 'user_id' })
    .select()
  if (error) throw error
  return data?.[0] ?? null
}

export async function getProfileByUserId(user_id: string) {
  const { data, error } = await supabaseServer.from('profiles').select('*').eq('user_id', user_id).maybeSingle()
  if (error) throw error
  return data
}

export async function searchMentorsBySkill(skill: string, limit = 20) {
  const { data, error } = await supabaseServer
    .from('profiles')
    .select('*')
    .contains('skills', [skill])
    .eq('role', 'mentor')
    .limit(limit)

  if (error) throw error
  return data
}
