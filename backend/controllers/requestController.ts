/**
 * requestController.ts
 * Business logic for help request lifecycle.
 * Enforces who can do what: students create, mentors accept/reject/update.
 */
import {
  createRequestSchema,
  updateStatusSchema,
  type RequestStatus,
} from '../models/schemas'
import {
  createRequest,
  getRequestsByStudent,
  getRequestById,
  updateRequestStatus,
  assignMentorToRequest,
} from '../services/requestService'
import { getMentorDashboardRequests } from '../services/mentorService'
import {
  notifyRequestAccepted,
  notifyRequestRejected,
  notifyStatusUpdated,
} from '../services/notificationService'
import { getProfileByUserId } from '../services/profileService'
import type { DbHelpRequest } from '../models/types'

// ─── Student: create request ──────────────────────────────────

export async function submitRequest(
  student_id: string,
  payload: unknown
): Promise<DbHelpRequest> {
  const validated = createRequestSchema.parse(payload)
  return createRequest({ ...validated, student_id })
}

// ─── Student: view own requests ───────────────────────────────

export async function getStudentRequests(student_id: string): Promise<DbHelpRequest[]> {
  return getRequestsByStudent(student_id)
}

// ─── Mentor: view dashboard requests ─────────────────────────

export async function getMentorRequests(mentor_id: string): Promise<DbHelpRequest[]> {
  return getMentorDashboardRequests(mentor_id)
}

// ─── Mentor: accept request ───────────────────────────────────

export async function acceptHelpRequest(
  mentor_id: string,
  request_id: string
): Promise<DbHelpRequest> {
  const request = await getRequestById(request_id)
  if (!request) throw new Error('Request not found')

  const updated = await assignMentorToRequest(request_id, mentor_id)

  // Notify the student
  const mentorProfile = await getProfileByUserId(mentor_id)
  await notifyRequestAccepted(
    request.student_id,
    request_id,
    mentorProfile?.full_name ?? 'Your mentor'
  ).catch(() => {/* non-fatal */})

  return updated
}

// ─── Mentor: reject request ───────────────────────────────────

export async function rejectHelpRequest(
  mentor_id: string,
  request_id: string
): Promise<DbHelpRequest> {
  const request = await getRequestById(request_id)
  if (!request) throw new Error('Request not found')
  if (request.status !== 'open') throw new Error('Only open requests can be rejected')

  const updated = await updateRequestStatus(request_id, 'rejected', mentor_id)

  const mentorProfile = await getProfileByUserId(mentor_id)
  await notifyRequestRejected(
    request.student_id,
    request_id,
    mentorProfile?.full_name ?? 'Your mentor'
  ).catch(() => {/* non-fatal */})

  return updated
}

// ─── Mentor: update request status ───────────────────────────

/**
 * Only the ASSIGNED mentor can update status after acceptance.
 * Students closing their own request is also allowed.
 */
export async function changeRequestStatus(
  actor_id: string,
  actor_role: string,
  request_id: string,
  newStatus: RequestStatus
): Promise<DbHelpRequest> {
  const { request_id: rid, status } = updateStatusSchema.parse({ request_id, status: newStatus })

  const request = await getRequestById(rid)
  if (!request) throw new Error('Request not found')

  // Permission check
  if (actor_role === 'mentor' && request.mentor_id !== actor_id) {
    throw new Error('Forbidden: you are not the assigned mentor for this request')
  }
  if (actor_role === 'student' && request.student_id !== actor_id) {
    throw new Error('Forbidden: you do not own this request')
  }
  // Students may only close their own requests
  if (actor_role === 'student' && status !== 'closed') {
    throw new Error('Students may only close requests')
  }

  const updated = await updateRequestStatus(rid, status, actor_id)

  // Notify the student of the updated status (if mentor changed it)
  if (actor_role === 'mentor') {
    await notifyStatusUpdated(request.student_id, rid, status).catch(() => {/* non-fatal */})
  }

  return updated
}
