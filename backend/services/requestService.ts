import supabaseServer from '../config/supabaseServer'
import type { MentorshipRequestRecord, MentorshipRequestStatus, MentorshipRequestType } from '@/types/request'

type RequestPayload = {
  student_id: string
  title: string
  description: string
  domain: string
  deadline?: string
  type: MentorshipRequestType
  assigned_mentor?: string
}

type RequestProfileRefRow = {
  id: string
  full_name: string | null
  avatar_url: string | null
}

type RequestRow = Omit<MentorshipRequestRecord, 'status' | 'type' | 'student' | 'mentor'> & {
  type: MentorshipRequestType | null
  status: MentorshipRequestStatus
  student?: RequestProfileRefRow | RequestProfileRefRow[] | null
  mentor?: RequestProfileRefRow | RequestProfileRefRow[] | null
}

const REQUEST_SELECT = `
  id,
  student_id,
  title,
  description,
  domain,
  deadline,
  type,
  status,
  assigned_mentor,
  updated_by,
  created_at,
  updated_at,
  student:profiles!requests_student_id_fkey (
    id,
    full_name,
    avatar_url
  ),
  mentor:profiles!requests_assigned_mentor_fkey (
    id,
    full_name,
    avatar_url
  )
`

function pickProfileRef(
  value?: RequestProfileRefRow | RequestProfileRefRow[] | null
): MentorshipRequestRecord['student'] {
  if (Array.isArray(value)) {
    return value[0] ?? null
  }

  return value ?? null
}

function mapRequestRow(row: RequestRow): MentorshipRequestRecord {
  return {
    id: row.id,
    student_id: row.student_id,
    title: row.title,
    description: row.description,
    domain: row.domain,
    deadline: row.deadline,
    type: row.type,
    status: row.status,
    assigned_mentor: row.assigned_mentor,
    updated_by: row.updated_by,
    created_at: row.created_at,
    updated_at: row.updated_at,
    student: pickProfileRef(row.student),
    mentor: pickProfileRef(row.mentor),
  }
}

export async function createRequest(payload: RequestPayload) {
  const { data, error } = await supabaseServer
    .from('requests')
    .insert(payload)
    .select(REQUEST_SELECT)
    .maybeSingle()
  if (error) throw error
  return data ? mapRequestRow(data as RequestRow) : null
}

export async function updateRequestStatus(request_id: string, status: string, actorId?: string) {
  // TODO: validate allowed transitions elsewhere
  const { data, error } = await supabaseServer
    .from('requests')
    .update({ status, updated_by: actorId })
    .eq('id', request_id)
    .select(REQUEST_SELECT)
    .maybeSingle()
  if (error) throw error
  return data ? mapRequestRow(data as RequestRow) : null
}

export async function getRequestById(request_id: string) {
  const { data, error } = await supabaseServer.from('requests').select('*').eq('id', request_id).maybeSingle()
  if (error) throw error
  return data
}

export async function listRequestsForUser(userId: string, role?: string) {
  let query = supabaseServer
    .from('requests')
    .select(REQUEST_SELECT)
    .order('created_at', { ascending: false })
  const normalizedRole = typeof role === 'string' ? role.toLowerCase() : ''

  if (normalizedRole === 'mentor') {
    query = query.eq('assigned_mentor', userId)
  } else {
    query = query.eq('student_id', userId)
  }

  const { data, error } = await query
  if (error) throw error
  return ((data as RequestRow[] | null) ?? []).map(mapRequestRow)
}

export async function listAllRequests() {
  const { data, error } = await supabaseServer
    .from('requests')
    .select(REQUEST_SELECT)
    .order('created_at', { ascending: false })

  if (error) throw error
  return ((data as RequestRow[] | null) ?? []).map(mapRequestRow)
}
