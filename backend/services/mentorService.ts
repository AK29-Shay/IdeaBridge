/**
 * mentorService.ts
 * Mentor-specific actions: accepting/rejecting requests, 
 * updating availability, fetching dashboard data.
 */
import supabaseServer from '../config/supabaseServer'
import {
  assignMentorToRequest,
  updateRequestStatus,
  getRequestsForMentor,
} from './requestService'
import { getProfileByUserId, upsertProfile } from './profileService'
import type { DbHelpRequest, DbProfile } from '../models/types'

// ─── Accept request ───────────────────────────────────────────

/**
 * Mentor accepts an open help request.
 * Validates that the request is still open before accepting.
 */
export async function acceptRequest(
  mentor_user_id: string,
  request_id: string
): Promise<DbHelpRequest> {
  return assignMentorToRequest(request_id, mentor_user_id)
}

// ─── Reject request ───────────────────────────────────────────

/**
 * Mentor rejects an open help request.
 * Uses the shared status updater with 'rejected' transition.
 */
export async function rejectRequest(
  mentor_user_id: string,
  request_id: string
): Promise<DbHelpRequest> {
  return updateRequestStatus(request_id, 'rejected', mentor_user_id)
}

// ─── Update availability ──────────────────────────────────────

export interface AvailabilityUpdate {
  availability?: string
  availability_status?: string
  availability_calendar_note?: string
}

export async function updateMentorAvailability(
  mentor_user_id: string,
  update: AvailabilityUpdate
): Promise<DbProfile> {
  return upsertProfile({ user_id: mentor_user_id, ...update } as any)
}

// ─── Dashboard data ───────────────────────────────────────────

/** Fetches all incoming and assigned requests for a mentor's dashboard */
export async function getMentorDashboardRequests(
  mentor_user_id: string
): Promise<DbHelpRequest[]> {
  const profile = await getProfileByUserId(mentor_user_id)
  const skills = profile?.skills ?? []
  return getRequestsForMentor(mentor_user_id, skills)
}

// ─── Ratings summary ──────────────────────────────────────────

export interface RatingSummary {
  average: number
  count: number
  breakdown: Record<number, number> // e.g. { 5: 10, 4: 5, 3: 2, 2: 1, 1: 0 }
}

export async function getMentorRatingSummary(mentor_user_id: string): Promise<RatingSummary> {
  const { data, error } = await supabaseServer
    .from('ratings')
    .select('rating')
    .eq('mentor_id', mentor_user_id)

  if (error) throw new Error(error.message)

  const ratings: number[] = (data ?? []).map((r: { rating: number }) => r.rating)
  const count = ratings.length
  const average = count > 0 ? ratings.reduce((a, b) => a + b, 0) / count : 0

  const breakdown: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  for (const r of ratings) breakdown[r] = (breakdown[r] ?? 0) + 1

  return { average: parseFloat(average.toFixed(2)), count, breakdown }
}
