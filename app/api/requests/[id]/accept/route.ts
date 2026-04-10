/**
 * POST /api/requests/[id]/accept
 * Mentor accepts an open help request.
 * Assigns the mentor, moves status → 'accepted', notifies the student.
 */
import { NextRequest, NextResponse } from 'next/server'
import { withRole } from '../../../../../backend/middleware/requireRole'
import { acceptHelpRequest } from '../../../../../backend/controllers/requestController'
import { handleError } from '../../../../../backend/utils/helpers'

export const POST = withRole(['mentor'], async (_req: NextRequest, user, _profile, ctx) => {
  try {
    const { id } = await ctx!.params
    const updated = await acceptHelpRequest(user.id, id)
    return NextResponse.json({ data: updated })
  } catch (e) {
    return handleError(e)
  }
})
