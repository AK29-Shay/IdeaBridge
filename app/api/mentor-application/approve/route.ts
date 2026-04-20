import { NextResponse } from 'next/server'
import { approveApplication } from '@/backend/modules/mentor-application'
import { getUserFromAuthHeader } from '../../../../backend/middleware/auth'
import { getProfileByUserId } from '@/backend/modules/profile'

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

    const profile = await getProfileByUserId(user.user.id)
    const role = typeof profile?.role === 'string' ? profile.role.toLowerCase() : ''
    if (!profile || role !== 'admin') return new NextResponse(JSON.stringify({ error: 'Forbidden' }), { status: 403 })

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
