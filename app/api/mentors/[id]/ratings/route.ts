/**
 * GET /api/mentors/[id]/ratings
 * Returns all ratings for a specific mentor.
 * Public — no auth required.
 */
import { NextRequest, NextResponse } from 'next/server'
import { fetchMentorRatings } from '../../../../backend/controllers/ratingController'
import { handleError } from '../../../../backend/utils/helpers'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const ratings = await fetchMentorRatings(id)
    return NextResponse.json({ data: ratings })
  } catch (e) {
    return handleError(e)
  }
}
