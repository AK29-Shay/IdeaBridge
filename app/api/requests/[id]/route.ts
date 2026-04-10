/**
 * GET /api/requests/[id]
 * Fetch a single help request by its ID.
 * - Students can only fetch their own requests
 * - Mentors can fetch any request
 */
import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '../../../../backend/middleware/auth'
import { getRequestById } from '../../../../backend/services/requestService'
import { getProfileByUserId } from '../../../../backend/services/profileService'
import { handleError } from '../../../../backend/utils/helpers'

export const GET = withAuth(async (_req: NextRequest, user, ctx) => {
  try {
    const { id } = await ctx!.params
    const request = await getRequestById(id)
    if (!request) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    const profile = await getProfileByUserId(user.id)
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Students can only view their own requests
    if (profile.role === 'student' && request.student_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ data: request })
  } catch (e) {
    return handleError(e)
  }
})
