/**
 * POST /api/requests/[id]/reject
 * Mentor rejects an open help request.
 * Moves status → 'rejected', notifies the student.
 */
import { NextRequest, NextResponse } from 'next/server'
import { withRole } from '../../../../../backend/middleware/requireRole'
import { rejectHelpRequest } from '../../../../../backend/controllers/requestController'
import { handleError } from '../../../../../backend/utils/helpers'

export const POST = withRole(['mentor'], async (_req: NextRequest, user, _profile, ctx) => {
  try {
    const { id } = await ctx!.params
    const updated = await rejectHelpRequest(user.id, id)
    return NextResponse.json({ data: updated })
  } catch (e) {
    return handleError(e)
  }
})
