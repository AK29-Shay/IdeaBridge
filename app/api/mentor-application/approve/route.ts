import { NextResponse } from 'next/server'
import { approveApplication } from '@/backend/modules/mentor-application'
import { getUserFromAuthHeader } from '../../../../backend/middleware/auth'
import { getProfileByUserId } from '@/backend/modules/profile'

export async function PATCH(request: Request) {
  try {
    const authorization = request.headers.get('authorization')
    const user = await getUserFromAuthHeader(authorization)
    if (!user) return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

    const profile = await getProfileByUserId(user.user.id)
    if (!profile || profile.role !== 'admin') return new NextResponse(JSON.stringify({ error: 'Forbidden' }), { status: 403 })

    const body = await request.json()
    const { application_id } = body
    const data = await approveApplication(application_id)
    return NextResponse.json(data)
  } catch (e: any) {
    return new NextResponse(JSON.stringify({ error: e.message || String(e) }), { status: 400 })
  }
}
