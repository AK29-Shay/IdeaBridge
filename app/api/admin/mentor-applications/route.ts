import { NextResponse } from 'next/server'

import { getProfileByUserId } from '@/backend/modules/profile'
import {
  listMentorApplications,
  setApplicationStatus,
} from '@/backend/services/mentorApplicationService'
import { getUserFromAuthHeader } from '@/backend/middleware/auth'
import { getErrorMessage } from '@/lib/errorMessage'

async function requireAdmin(authorization: string | null) {
  const user = await getUserFromAuthHeader(authorization)
  if (!user) {
    return { error: new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 }) }
  }

  const profile = (await getProfileByUserId(user.user.id)) as { role?: string | null } | null
  const role = typeof profile?.role === 'string' ? profile.role.toLowerCase() : ''
  if (!profile || role !== 'admin') {
    return { error: new NextResponse(JSON.stringify({ error: 'Forbidden' }), { status: 403 }) }
  }

  return { user }
}

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin(request.headers.get('authorization'))
    if ('error' in auth) return auth.error

    const data = await listMentorApplications()
    return NextResponse.json(data)
  } catch (error: unknown) {
    return new NextResponse(JSON.stringify({ error: getErrorMessage(error, 'Failed to load mentor applications.') }), { status: 400 })
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await requireAdmin(request.headers.get('authorization'))
    if ('error' in auth) return auth.error

    const body = await request.json()
    const applicationId = typeof body?.application_id === 'string' ? body.application_id : ''
    const status = body?.status === 'approved' || body?.status === 'rejected' ? body.status : null

    if (!applicationId || !status) {
      return new NextResponse(JSON.stringify({ error: 'application_id and a valid status are required.' }), { status: 400 })
    }

    const data = await setApplicationStatus(applicationId, status)
    return NextResponse.json(data)
  } catch (error: unknown) {
    return new NextResponse(JSON.stringify({ error: getErrorMessage(error, 'Failed to update mentor application.') }), { status: 400 })
  }
}
