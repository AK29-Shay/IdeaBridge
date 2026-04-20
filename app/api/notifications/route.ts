import { NextResponse } from 'next/server'
import { notify } from '@/backend/modules/notification'
import { listNotificationsForUser } from '@/backend/services/notificationService'
import { getUserFromAuthHeader } from '../../../backend/middleware/auth'
import { getErrorMessage } from '@/lib/errorMessage'

export async function GET(request: Request) {
  try {
    const authorization = request.headers.get('authorization')
    const user = await getUserFromAuthHeader(authorization)
    if (!user) return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

    const data = await listNotificationsForUser(user.user.id)
    return NextResponse.json(data)
  } catch (error: unknown) {
    return new NextResponse(JSON.stringify({ error: getErrorMessage(error, 'Failed to load notifications.') }), { status: 400 })
  }
}

export async function POST(request: Request) {
  try {
    const authorization = request.headers.get('authorization')
    const user = await getUserFromAuthHeader(authorization)
    if (!user) return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

    const body = await request.json()
    body.actor_id = user.user.id
    const data = await notify(body)
    return NextResponse.json(data)
  } catch (error: unknown) {
    return new NextResponse(JSON.stringify({ error: getErrorMessage(error, 'Failed to create notification.') }), { status: 400 })
  }
}
