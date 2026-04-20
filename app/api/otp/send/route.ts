import { NextResponse } from 'next/server'
import { sendOtp } from '@/backend/modules/otp'
import { getUserFromAuthHeader } from '../../../../backend/middleware/auth'

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
