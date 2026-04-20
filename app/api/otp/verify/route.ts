import { NextResponse } from 'next/server'
import { verifyUserOtp } from '@/backend/modules/otp'
import { getUserFromAuthHeader } from '../../../../backend/middleware/auth'
import { getErrorMessage } from '@/lib/errorMessage'

export async function POST(request: Request) {
  try {
    const authorization = request.headers.get('authorization')
    const user = await getUserFromAuthHeader(authorization)
    if (!user) return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

    const body = await request.json()
    const { otp } = body
    const result = await verifyUserOtp(user.user.id, otp)
    if (!result.ok) return new NextResponse(JSON.stringify({ error: result.reason }), { status: 400 })
    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    return new NextResponse(JSON.stringify({ error: getErrorMessage(error, 'Failed to verify OTP.') }), { status: 400 })
  }
}
