/**
 * PATCH /api/notifications/[id]/read
 * Marks a single notification as read.
 * The user must own the notification (enforced in the service layer).
 */
import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '../../../../../backend/middleware/auth'
import { markRead } from '../../../../../backend/controllers/notificationController'
import { handleError } from '../../../../../backend/utils/helpers'

export const PATCH = withAuth(async (
  _req: NextRequest,
  user,
  ctx
) => {
  try {
    const { id } = await ctx!.params
    const notification = await markRead(id, user.id)
    return NextResponse.json({ data: notification })
  } catch (e) {
    return handleError(e)
  }
})
