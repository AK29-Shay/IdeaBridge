/**
 * GET  /api/notifications       → fetch all notifications for the logged-in user
 * PATCH /api/notifications      → mark ALL notifications as read
 */
import { NextResponse } from 'next/server'
import { withAuth } from '../../../backend/middleware/auth'
import {
  fetchNotifications,
  markAllRead,
} from '../../../backend/controllers/notificationController'
import { handleError } from '../../../backend/utils/helpers'

/** GET /api/notifications — returns the caller's notifications (newest first) */
export const GET = withAuth(async (_req, user) => {
  try {
    const notifications = await fetchNotifications(user.id)
    return NextResponse.json({ data: notifications })
  } catch (e) {
    return handleError(e)
  }
})

/** PATCH /api/notifications — marks ALL unread notifications as read */
export const PATCH = withAuth(async (_req, user) => {
  try {
    await markAllRead(user.id)
    return NextResponse.json({ message: 'All notifications marked as read' })
  } catch (e) {
    return handleError(e)
  }
})
