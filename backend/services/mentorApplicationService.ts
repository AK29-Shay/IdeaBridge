import supabaseServer from '../config/supabaseServer'

type MentorApplicationPayload = {
  user_id: string
  cv_url?: string
  expertise: string[]
  statement?: string
}

type MentorApplicationRow = {
  id: string
  user_id: string
  cv_url: string | null
  expertise: string[] | null
  statement: string | null
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  applicant?: {
    id: string
    full_name: string | null
    avatar_url: string | null
    role: string | null
  } | {
    id: string
    full_name: string | null
    avatar_url: string | null
    role: string | null
  }[] | null
}

function mapApplication(row: MentorApplicationRow) {
  const applicant = Array.isArray(row.applicant) ? row.applicant[0] ?? null : row.applicant ?? null

  return {
    id: row.id,
    user_id: row.user_id,
    cv_url: row.cv_url,
    expertise: Array.isArray(row.expertise) ? row.expertise : [],
    statement: row.statement,
    status: row.status,
    created_at: row.created_at,
    applicant,
  }
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

  const record = data?.[0]
  if (record?.user_id && status === 'approved') {
    const { error: profileError } = await supabaseServer
      .from('profiles')
      .update({ role: 'Mentor' })
      .eq('id', record.user_id)

    if (profileError) throw profileError
  }

  return record
}

export async function getMentorApplicationForUser(userId: string) {
  const { data, error } = await supabaseServer
    .from('mentor_applications')
    .select('id,user_id,cv_url,expertise,statement,status,created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .maybeSingle()

  if (error) throw error
  return data
}

export async function listMentorApplications() {
  const { data, error } = await supabaseServer
    .from('mentor_applications')
    .select(`
      id,
      user_id,
      cv_url,
      expertise,
      statement,
      status,
      created_at,
      applicant:profiles!mentor_applications_user_id_fkey (
        id,
        full_name,
        avatar_url,
        role
      )
    `)
    .order('created_at', { ascending: false })

  if (error) throw error

  return ((data as MentorApplicationRow[] | null) ?? []).map(mapApplication)
}
