/**
 * POST /api/otp/send
 * Generates a 6-digit OTP for the authenticated user and stores it.
 * In production the OTP is stripped from the response.
 */
import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '../../../../backend/middleware/auth'
import { handleSendOtp } from '../../../../backend/controllers/otpController'
import { handleError } from '../../../../backend/utils/helpers'

export const POST = withAuth(async (_req: NextRequest, user) => {
  try {
    const result = await handleSendOtp({ user_id: user.id })
    // Strip OTP from response in production
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ message: result.message })
    }
    return NextResponse.json(result)
  } catch (e) {
    return handleError(e)
  }
})
