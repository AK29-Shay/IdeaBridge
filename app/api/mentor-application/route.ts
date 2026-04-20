import { NextResponse } from 'next/server'
import { submitApplication } from '@/backend/modules/mentor-application'
import { getUserFromAuthHeader } from '../../../backend/middleware/auth'
import { getErrorMessage, hasErrorCode } from '@/lib/errorMessage'

export async function POST(request: Request) {
  try {
    const authorization = request.headers.get('authorization')
    const user = await getUserFromAuthHeader(authorization)
    if (!user) return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

    const body = await request.json()
    body.user_id = user.user.id
    const data = await submitApplication(body)
    return NextResponse.json(data)
  } catch (error: unknown) {
    const status = hasErrorCode(error, 'DUPLICATE') ? 409 : 400
    return new NextResponse(JSON.stringify({ error: getErrorMessage(error, 'Failed to submit mentor application.') }), { status })
  }
}
