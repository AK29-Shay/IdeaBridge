/**
 * POST /api/otp/verify
 * Verifies the 6-digit OTP submitted by the authenticated user.
 * Body: { otp: string }
 */
import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '../../../../backend/middleware/auth'
import { handleVerifyOtp } from '../../../../backend/controllers/otpController'
import { handleError } from '../../../../backend/utils/helpers'

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
