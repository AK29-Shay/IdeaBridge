/**
 * mentorController.ts
 * Mentor dashboard actions: accept/reject, availability, ratings summary.
 */
import { mentorSearchSchema } from '../models/schemas'
import {
  acceptRequest,
  rejectRequest,
  updateMentorAvailability,
  getMentorRatingSummary,
  type AvailabilityUpdate,
  type RatingSummary,
} from '../services/mentorService'
import { searchMentors } from '../services/profileService'
import type { DbHelpRequest, DbProfile } from '../models/types'

// ─── Accept / reject ──────────────────────────────────────────

export async function handleAcceptRequest(
  mentor_id: string,
  request_id: string
): Promise<DbHelpRequest> {
  return acceptRequest(mentor_id, request_id)
}

export async function handleRejectRequest(
  mentor_id: string,
  request_id: string
): Promise<DbHelpRequest> {
  return rejectRequest(mentor_id, request_id)
}

// ─── Availability ─────────────────────────────────────────────

export async function setMentorAvailability(
  mentor_id: string,
  payload: AvailabilityUpdate
): Promise<DbProfile> {
  return updateMentorAvailability(mentor_id, payload)
}

// ─── Ratings ──────────────────────────────────────────────────

export async function fetchMentorRatingSummary(mentor_id: string): Promise<RatingSummary> {
  return getMentorRatingSummary(mentor_id)
}

// ─── Search ───────────────────────────────────────────────────

/**
 * Validates search query params with Zod then calls profileService.
 * Raw query params (all strings) come from NextRequest.nextUrl.searchParams.
 */
export async function handleMentorSearch(rawParams: Record<string, string>): Promise<DbProfile[]> {
  const parsed = mentorSearchSchema.parse(rawParams)

  const skills = parsed.skills
    ? parsed.skills.split(',').map((s: string) => s.trim()).filter(Boolean)
    : undefined

  return searchMentors({
    skills,
    availability:        parsed.availability,
    availability_status: parsed.availability_status,
    min_rating:          parsed.min_rating,
    limit:               parsed.limit,
    offset:              parsed.offset,
  })
}
