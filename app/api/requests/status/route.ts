import { NextResponse } from 'next/server'
import { getUserFromAuthHeader } from '../../../../backend/middleware/auth'
import { getRequestById, updateRequestStatus } from '@/backend/modules/request'
import { getProfileByUserId } from '@/backend/modules/profile'

export const PATCH = withAuth(async (req: NextRequest, user) => {
  try {
    const authorization = request.headers.get('authorization')
    const user = await getUserFromAuthHeader(authorization)
    if (!user) return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

    const body = await request.json()
    const { request_id, status } = body
    const reqRecord = await getRequestById(request_id)
    if (!reqRecord) return new NextResponse(JSON.stringify({ error: 'Not found' }), { status: 404 })

    const profile = await getProfileByUserId(user.user.id)
    const role = typeof profile?.role === 'string' ? profile.role.toLowerCase() : ''
    // only assigned mentor or admin may update
    if (!(profile && (role === 'admin' || String(reqRecord.assigned_mentor) === String(user.user.id)))) {
      return new NextResponse(JSON.stringify({ error: 'Forbidden' }), { status: 403 })
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
