import { NextResponse } from 'next/server'

import { getProfileByUserId } from '@/backend/modules/profile'
import { listAllRequests } from '@/backend/services/requestService'
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

    const data = await listAllRequests()
    return NextResponse.json(data)
  } catch (error: unknown) {
    return new NextResponse(JSON.stringify({ error: getErrorMessage(error, 'Failed to load admin requests.') }), { status: 400 })
  }
}
