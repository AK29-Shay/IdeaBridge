import { NextResponse } from 'next/server'
import { verifyUserOtp } from '../../../../backend/controllers/otpController'
import { getUserFromAuthHeader } from '../../../../backend/middleware/auth'

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
  } catch (e: any) {
    return new NextResponse(JSON.stringify({ error: e.message || String(e) }), { status: 400 })
  }
}
