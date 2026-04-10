/**
 * POST /api/ratings          → student submits a rating for a completed request
 * GET  /api/ratings?mentor_id → fetch all ratings for a given mentor (public)
 */
import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '../../../backend/middleware/auth'
import { getProfileByUserId } from '../../../backend/services/profileService'
import {
  submitRating,
  fetchMentorRatings,
} from '../../../backend/controllers/ratingController'
import { handleError } from '../../../backend/utils/helpers'

/** POST /api/ratings — students only */
export const POST = withAuth(async (req: NextRequest, user) => {
  try {
    const profile = await getProfileByUserId(user.id)
    if (!profile || profile.role !== 'student') {
      return NextResponse.json(
        { error: 'Forbidden: only students can submit ratings' },
        { status: 403 }
      )
    }

    const body = await req.json()
    // student_id is always injected from auth — never trusted from body
    const rating = await submitRating(user.id, body)
    return NextResponse.json({ data: rating }, { status: 201 })
  } catch (e) {
    return handleError(e)
  }
})

/** GET /api/ratings?mentor_id=<uuid> — public: anyone can read ratings */
export async function GET(req: NextRequest) {
  try {
    const mentor_id = req.nextUrl.searchParams.get('mentor_id')
    if (!mentor_id) {
      return NextResponse.json(
        { error: 'mentor_id query param is required' },
        { status: 400 }
      )
    }
    const ratings = await fetchMentorRatings(mentor_id)
    return NextResponse.json({ data: ratings })
  } catch (e) {
    return handleError(e)
  }
}
