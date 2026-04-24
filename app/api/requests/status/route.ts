import { NextResponse } from 'next/server'
import { getUserFromAuthHeader } from '../../../../backend/middleware/auth'
import { getRequestById, updateRequestStatus } from '@/backend/modules/request'
import { getProfileByUserId } from '@/backend/modules/profile'
import { createNotification } from '@/backend/services/notificationService'
import { getErrorMessage } from '@/lib/errorMessage'

export async function PATCH(request: Request) {
  try {
    const authorization = request.headers.get('authorization')
    const user = await getUserFromAuthHeader(authorization)
    if (!user) return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

    const body = await request.json()
    const { request_id, status } = body
    const reqRecord = (await getRequestById(request_id)) as { assigned_mentor?: string | null; student_id?: string | null } | null
    if (!reqRecord) return new NextResponse(JSON.stringify({ error: 'Not found' }), { status: 404 })

    const profile = (await getProfileByUserId(user.user.id)) as { role?: string | null } | null
    const role = typeof profile?.role === 'string' ? profile.role.toLowerCase() : ''
    // only assigned mentor or admin may update
    if (!(profile && (role === 'admin' || String(reqRecord.assigned_mentor) === String(user.user.id)))) {
      return new NextResponse(JSON.stringify({ error: 'Forbidden' }), { status: 403 })
    }

    const updated = await updateRequestStatus(request_id, status, user.user.id)
    if (typeof reqRecord.student_id === 'string') {
      const statusTitle =
        status === 'in_progress' ? 'Mentorship request accepted' :
        status === 'cancelled' ? 'Mentorship request declined' :
        status === 'completed' ? 'Mentorship completed' :
        'Mentorship request updated'

      await createNotification({
        user_id: reqRecord.student_id,
        type: 'request_status_updated',
        payload: {
          request_id,
          status,
          title: statusTitle,
        },
      })
    }

    return NextResponse.json(updated)
  } catch (error: unknown) {
    return new NextResponse(JSON.stringify({ error: getErrorMessage(error, 'Failed to update request status.') }), { status: 400 })
  }
}
