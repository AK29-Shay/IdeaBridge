import { NextResponse } from 'next/server'
import { sendOtp } from '@/backend/modules/otp'
import { getUserFromAuthHeader } from '../../../../backend/middleware/auth'
import { getErrorMessage } from '@/lib/errorMessage'

export async function POST(request: Request) {
  try {
    const authorization = request.headers.get('authorization')
    const user = await getUserFromAuthHeader(authorization)
    if (!user) return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

    const result = await sendOtp(user.user.id)
    // In production do NOT return OTP in response. This is for development convenience.
    return NextResponse.json({ ok: true, otp: result.otp })
  } catch (error: unknown) {
    return new NextResponse(JSON.stringify({ error: getErrorMessage(error, 'Failed to send OTP.') }), { status: 400 })
  }
}
