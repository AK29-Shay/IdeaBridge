/**
 * GET /api/mentors/[id]
 * Fetches a single mentor's public profile.
 * Public — no auth required.
 */
import { NextRequest, NextResponse } from 'next/server'
import { fetchMentorDetail } from '../../../../backend/controllers/profileController'
import { handleError } from '../../../../backend/utils/helpers'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const mentor = await fetchMentorDetail(id)
    if (!mentor) {
      return NextResponse.json({ error: 'Mentor not found' }, { status: 404 })
    }
    return NextResponse.json({ data: mentor })
  } catch (e) {
    return handleError(e)
  }
}
