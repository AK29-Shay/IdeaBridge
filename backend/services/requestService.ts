/**
 * requestService.ts
 * Database operations for help requests.
 */
import supabaseServer from '../config/supabaseServer'
import type { DbHelpRequest, RequestStatus } from '../models/types'
import { STATUS_TRANSITIONS } from '../models/schemas'

// ─── Create ───────────────────────────────────────────────────

export interface CreateRequestPayload {
  student_id:   string
  title:        string
  request_type: 'full_project' | 'specific_idea'
  description:  string
  domain:       string
  deadline?:    string
}

export async function createRequest(payload: CreateRequestPayload): Promise<DbHelpRequest> {
  const { data, error } = await supabaseServer
    .from('help_requests')
    .insert({ ...payload, status: 'open' })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

// ─── Read ─────────────────────────────────────────────────────

export async function getRequestById(request_id: string): Promise<DbHelpRequest | null> {
  const { data, error } = await supabaseServer
    .from('help_requests')
    .select('*')
    .eq('id', request_id)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data
}

/** All requests created by a given student */
export async function getRequestsByStudent(student_id: string): Promise<DbHelpRequest[]> {
  const { data, error } = await supabaseServer
    .from('help_requests')
    .select('*')
    .eq('student_id', student_id)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

/**
 * Returns open/relevant requests for a mentor, filtered by their skills.
 * Shows: open requests + requests assigned to this mentor.
 */
export async function getRequestsForMentor(
  mentor_user_id: string,
  mentorSkills: string[]
): Promise<DbHelpRequest[]> {
  // Requests assigned to this mentor
  const { data: assigned, error: e1 } = await supabaseServer
    .from('help_requests')
    .select('*')
    .eq('mentor_id', mentor_user_id)
    .order('created_at', { ascending: false })

  if (e1) throw new Error(e1.message)

  // Open requests in matching domains (domain compared against skills for simplicity)
  const { data: open, error: e2 } = await supabaseServer
    .from('help_requests')
    .select('*')
    .eq('status', 'open')
    .is('mentor_id', null)
    .order('created_at', { ascending: false })
    .limit(50)

  if (e2) throw new Error(e2.message)

  // Deduplicate and merge
  const assignedIds = new Set((assigned ?? []).map((r: DbHelpRequest) => r.id))
  const combined = [
    ...(assigned ?? []),
    ...(open ?? []).filter((r: DbHelpRequest) => !assignedIds.has(r.id)),
  ]

  return combined
}

// ─── Update status ────────────────────────────────────────────

/**
 * Updates request status after validating the transition is allowed.
 * Throws if the transition is invalid.
 */
export async function updateRequestStatus(
  request_id: string,
  newStatus: RequestStatus,
  actorId: string
): Promise<DbHelpRequest> {
  const existing = await getRequestById(request_id)
  if (!existing) throw new Error('Request not found')

  const allowed = STATUS_TRANSITIONS[existing.status]
  if (!allowed.includes(newStatus)) {
    throw new Error(
      `Invalid status transition: ${existing.status} → ${newStatus}. Allowed: ${allowed.join(', ') || 'none'}`
    )
  }

  const updates: Partial<DbHelpRequest> = {
    status: newStatus,
    updated_by: actorId,
  }

  const { data, error } = await supabaseServer
    .from('help_requests')
    .update(updates)
    .eq('id', request_id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

/**
 * Assigns a mentor to a request (when mentor accepts).
 * Also transitions status to 'accepted'.
 */
export async function assignMentorToRequest(
  request_id: string,
  mentor_id: string
): Promise<DbHelpRequest> {
  const existing = await getRequestById(request_id)
  if (!existing) throw new Error('Request not found')
  if (existing.status !== 'open') {
    throw new Error('Only open requests can be accepted')
  }

  const { data, error } = await supabaseServer
    .from('help_requests')
    .update({ mentor_id, status: 'accepted', updated_by: mentor_id })
    .eq('id', request_id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}
