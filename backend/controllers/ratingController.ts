/**
 * ratingController.ts
 * Validates and enforces rating submission rules:
 * - Only the student who owns a COMPLETED request can submit a rating.
 * - One rating per request.
 */
import { createRatingSchema } from '../models/schemas'
import { addRating, getRatingsByMentor, hasStudentRated } from '../services/ratingService'
import { getRequestById } from '../services/requestService'
import { getProfileByUserId } from '../services/profileService'
import { notifyNewRating } from '../services/notificationService'
import type { DbRating } from '../models/types'

// ─── Submit rating ────────────────────────────────────────────

/**
 * A student submits a rating for a mentor after a COMPLETED request.
 * Guards:
 *  1. Request must exist and belong to the student
 *  2. Request status must be 'completed'
 *  3. Student must not have already rated this request
 */
export async function submitRating(
  student_id: string,
  payload: unknown
): Promise<DbRating> {
  const validated = createRatingSchema.parse(payload)

  // Guard 1: request must exist + belong to this student
  const request = await getRequestById(validated.request_id)
  if (!request) throw new Error('Request not found')
  if (request.student_id !== student_id) {
    throw new Error('Forbidden: you do not own this request')
  }

  // Guard 2: request must be completed
  if (request.status !== 'completed') {
    throw new Error('You can only rate a mentor once the request is completed')
  }

  // Guard 3: prevent duplicate rating
  const alreadyRated = await hasStudentRated(validated.request_id, student_id)
  if (alreadyRated) throw new Error('You have already submitted a rating for this request')

  const rating = await addRating({ ...validated, student_id })

  // Notify mentor (non-fatal — don't let it break the response)
  const studentProfile = await getProfileByUserId(student_id).catch(() => null)
  await notifyNewRating(
    validated.mentor_id,
    validated.rating,
    studentProfile?.full_name ?? 'A student'
  ).catch(() => {/* non-fatal */})

  return rating
}

// ─── Fetch ratings for mentor ─────────────────────────────────

export async function fetchMentorRatings(mentor_id: string) {
  return getRatingsByMentor(mentor_id)
}
