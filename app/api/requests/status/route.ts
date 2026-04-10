/**
 * PATCH /api/requests/status
 *
 * Updates the status of a help request.
 * - Mentors can update status for their assigned request
 * - Students can only close their own request
 *
 * Body: { request_id: string, status: RequestStatus }
 */
import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '../../../../backend/middleware/auth'
import { getProfileByUserId } from '../../../../backend/services/profileService'
import { changeRequestStatus } from '../../../../backend/controllers/requestController'
import type { RequestStatus } from '../../../../backend/models/schemas'
import { handleError } from '../../../../backend/utils/helpers'

export const PATCH = withAuth(async (req: NextRequest, user) => {
  try {
    const profile = await getProfileByUserId(user.id)
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }
    if (profile.role !== 'mentor' && profile.role !== 'student') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { request_id, status } = body as { request_id: string; status: RequestStatus }

    if (!request_id || !status) {
      return NextResponse.json(
        { error: 'request_id and status are required' },
        { status: 400 }
      )
    }

    const updated = await changeRequestStatus(user.id, profile.role, request_id, status)
    return NextResponse.json({ data: updated })
  } catch (e) {
    return handleError(e)
  }
})
