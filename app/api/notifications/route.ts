/**
 * GET  /api/notifications       â†’ fetch all notifications for the logged-in user
 * PATCH /api/notifications      â†’ mark ALL notifications as read
 */
import { NextResponse } from 'next/server'
import { notify } from '@/backend/modules/notification'
import { getUserFromAuthHeader } from '../../../backend/middleware/auth'

/** GET /api/notifications â€” returns the caller's notifications (newest first) */
export const GET = withAuth(async (_req, user) => {
  try {
    const notifications = await fetchNotifications(user.id)
    return NextResponse.json({ data: notifications })
  } catch (e) {
    return handleError(e)
  }
})

/** PATCH /api/notifications â€” marks ALL unread notifications as read */
export const PATCH = withAuth(async (_req, user) => {
  try {
    await markAllRead(user.id)
    return NextResponse.json({ message: 'All notifications marked as read' })
  } catch (e) {
    return handleError(e)
  }
})
