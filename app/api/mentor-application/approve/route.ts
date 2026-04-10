/**
 * PATCH /api/mentor-application/approve
 * Approves a pending mentor application (admin/internal use only).
 * This endpoint is intentionally restricted — in production gate it
 * behind a separate admin secret header or Supabase admin dashboard.
 *
 * Body: { application_id: string }
 */
import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '../../../../backend/middleware/auth'
import {
  approveApplication,
  rejectApplication,
} from '../../../../backend/controllers/mentorApplicationController'
import { handleError } from '../../../../backend/utils/helpers'

/**
 * PATCH /api/mentor-application/approve
 * Body: { application_id: string, action: 'approve' | 'reject' }
 *
 * Protected by ADMIN_SECRET header to avoid exposing this on the frontend.
 */
export const PATCH = withAuth(async (req: NextRequest, _user) => {
  try {
    // Simple secret-key guard for admin-only route
    const adminSecret = req.headers.get('x-admin-secret')
    if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { application_id, action } = body as {
      application_id: string
      action: 'approve' | 'reject'
    }

    if (!application_id || !action) {
      return NextResponse.json(
        { error: 'application_id and action are required' },
        { status: 400 }
      )
    }

    const data =
      action === 'approve'
        ? await approveApplication(application_id)
        : await rejectApplication(application_id)

    return NextResponse.json({ data })
  } catch (e) {
    return handleError(e)
  }
})
