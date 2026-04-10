/**
 * POST /api/otp/resend
 * Regenerates and resends the OTP for the authenticated user.
 * Replaces any existing unexpired OTP.
 */
import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '../../../../backend/middleware/auth'
import { handleResendOtp } from '../../../../backend/controllers/otpController'
import { handleError } from '../../../../backend/utils/helpers'

export const POST = withAuth(async (_req: NextRequest, user) => {
  try {
    const result = await handleResendOtp({ user_id: user.id })
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ message: result.message })
    }
    return NextResponse.json(result)
  } catch (e) {
    return handleError(e)
  }
})
