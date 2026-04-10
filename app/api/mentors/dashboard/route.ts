/**
 * GET   /api/mentors/dashboard  → mentor sees their assigned + open requests
 * PATCH /api/mentors/dashboard  → mentor updates their availability
 */
import { NextRequest, NextResponse } from 'next/server'
import { withRole } from '../../../backend/middleware/requireRole'
import { getMentorRequests } from '../../../backend/controllers/requestController'
import { updateAvailabilitySchema } from '../../../backend/models/schemas'
import { upsertProfile } from '../../../backend/services/profileService'
import { handleError } from '../../../backend/utils/helpers'

/** GET /api/mentors/dashboard — mentors only */
export const GET = withRole(['mentor'], async (_req, user) => {
  try {
    const requests = await getMentorRequests(user.id)
    return NextResponse.json({ data: requests })
  } catch (e) {
    return handleError(e)
  }
})

/** PATCH /api/mentors/dashboard — update mentor availability */
export const PATCH = withRole(['mentor'], async (req: NextRequest, user) => {
  try {
    const body = await req.json()
    const validated = updateAvailabilitySchema.parse(body)
    const updated = await upsertProfile({ user_id: user.id, ...validated } as Parameters<typeof upsertProfile>[0])
    return NextResponse.json({ data: updated })
  } catch (e) {
    return handleError(e)
  }
})
