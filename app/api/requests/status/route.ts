import { NextResponse } from 'next/server'
import { getUserFromAuthHeader } from '../../../../backend/middleware/auth'
import { getRequestById, updateRequestStatus } from '@/backend/modules/request'
import { getProfileByUserId } from '@/backend/modules/profile'

export async function PATCH(request: Request) {
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

    const updated = await updateRequestStatus(request_id, status, user.user.id)
    return NextResponse.json(updated)
  } catch (e: any) {
    return new NextResponse(JSON.stringify({ error: e.message || String(e) }), { status: 400 })
  }
}
