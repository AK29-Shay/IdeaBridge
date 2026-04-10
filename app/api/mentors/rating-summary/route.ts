/**
 * GET /api/mentors/rating-summary
 * Returns the logged-in mentor's rating average, count, and breakdown.
 */
import { NextResponse } from 'next/server'
import { withRole } from '../../../backend/middleware/requireRole'
import { fetchMentorRatingSummary } from '../../../backend/controllers/mentorController'
import { handleError } from '../../../backend/utils/helpers'

export const GET = withRole(['mentor'], async (_req, user) => {
  try {
    const summary = await fetchMentorRatingSummary(user.id)
    return NextResponse.json({ data: summary })
  } catch (e) {
    return handleError(e)
  }
})
