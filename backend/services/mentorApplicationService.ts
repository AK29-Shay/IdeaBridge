import supabaseServer from '../config/supabaseServer'

export async function createMentorApplication(payload: any) {
  // prevent duplicates
  const { data: existing } = await supabaseServer
    .from('mentor_applications')
    .select('*')
    .eq('user_id', payload.user_id)
    .maybeSingle()

  if (existing) {
    const err: any = new Error('Application already exists')
    err.code = 'DUPLICATE'
    throw err
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
