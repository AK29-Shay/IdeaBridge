import { NextResponse } from 'next/server'
import { sendOtp } from '../../../../backend/controllers/otpController'
import { getUserFromAuthHeader } from '../../../../backend/middleware/auth'

export async function POST(request: Request) {
  try {
    const authorization = request.headers.get('authorization')
    const user = await getUserFromAuthHeader(authorization)
    if (!user) return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

    const result = await sendOtp(user.user.id)
    // In production do NOT return OTP in response. This is for development convenience.
    return NextResponse.json({ ok: true, otp: result.otp })
  } catch (e: any) {
    return new NextResponse(JSON.stringify({ error: e.message || String(e) }), { status: 400 })
  }
}
