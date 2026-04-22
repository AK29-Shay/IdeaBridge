import supabaseServer from '../config/supabaseServer'

type MentorApplicationPayload = {
  user_id: string
  cv_url?: string
  expertise: string[]
  statement?: string
}

class DuplicateApplicationError extends Error {
  code = 'DUPLICATE'
}

export async function createMentorApplication(payload: MentorApplicationPayload) {
  // prevent duplicates
  const { data: existing } = await supabaseServer
    .from('mentor_applications')
    .select('*')
    .eq('user_id', payload.user_id)
    .maybeSingle()

  if (existing) {
    throw new DuplicateApplicationError('Application already exists')
  }

  const { data, error } = await supabaseServer.from('mentor_applications').insert(payload).select()
  if (error) throw error
  return data?.[0]
}

export async function setApplicationStatus(application_id: string, status: 'approved' | 'rejected') {
  const { data, error } = await supabaseServer
    .from('mentor_applications')
    .update({ status })
    .eq('id', application_id)
    .select()
  if (error) throw error
  return data?.[0]
}
