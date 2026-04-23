import { NextResponse } from 'next/server'
import { submitRequest } from '@/backend/modules/request'
import { createNotification } from '@/backend/services/notificationService'
import { listRequestsForUser } from '@/backend/services/requestService'
import { getProfileByUserId } from '@/backend/modules/profile'
import { getUserFromAuthHeader } from '../../../backend/middleware/auth'
import { getErrorMessage } from '@/lib/errorMessage'

export async function GET(request: Request) {
  try {
    const authorization = request.headers.get('authorization')
    const user = await getUserFromAuthHeader(authorization)
    if (!user) return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

    const profile = await getProfileByUserId(user.user.id)
    const data = await listRequestsForUser(user.user.id, typeof profile?.role === 'string' ? profile.role : undefined)
    return NextResponse.json(data)
  } catch (error: unknown) {
    return new NextResponse(JSON.stringify({ error: getErrorMessage(error, 'Failed to load requests.') }), { status: 400 })
  }
}

export async function POST(request: Request) {
  try {
    const authorization = request.headers.get('authorization')
    const user = await getUserFromAuthHeader(authorization)
    if (!user) return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

    const body = await request.json()
    body.student_id = user.user.id
    const data = await submitRequest(body)
    if (typeof data?.assigned_mentor === 'string') {
      await createNotification({
        user_id: data.assigned_mentor,
        type: 'mentorship_request',
        payload: {
          request_id: data.id,
          title: data.title,
          student_id: user.user.id,
        },
      })
    }
    return NextResponse.json(data)
  } catch (error: unknown) {
    return new NextResponse(JSON.stringify({ error: getErrorMessage(error, 'Failed to submit request.') }), { status: 400 })
  }
}
