/**
 * POST /api/mentor-application
 * A student submits an application to become a mentor.
 * One application per user — duplicates return 409.
 */
import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '../../../backend/middleware/auth'
import { submitApplication } from '../../../backend/controllers/mentorApplicationController'
import { handleError } from '../../../backend/utils/helpers'

export const POST = withAuth(async (req: NextRequest, user) => {
  try {
    const body = await req.json()
    // Always inject user_id from auth — never trust the body
    const data = await submitApplication({ ...body, user_id: user.id })
    return NextResponse.json({ data }, { status: 201 })
  } catch (e: unknown) {
    if (e instanceof Error && (e as NodeJS.ErrnoException & { code?: string }).code === 'DUPLICATE') {
      return NextResponse.json(
        { error: 'You have already submitted an application' },
        { status: 409 }
      )
    }
    return handleError(e)
  }
})
