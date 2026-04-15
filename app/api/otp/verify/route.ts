import { NextResponse } from 'next/server'
import { verifyUserOtp } from '@/backend/modules/otp'
import { getUserFromAuthHeader } from '../../../../backend/middleware/auth'

export const POST = withAuth(async (req: NextRequest, user) => {
  try {
    const body = await req.json()
    const { otp } = body

    if (!otp || typeof otp !== 'string') {
      return NextResponse.json({ error: 'otp is required' }, { status: 400 })
    }

    const result = await handleVerifyOtp({ user_id: user.id, otp })
    if (!result.success) {
      return NextResponse.json(
        { error: result.reason ?? 'OTP verification failed' },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    return handleError(e)
  }
})
