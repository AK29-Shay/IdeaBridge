import { NextResponse } from 'next/server'
import { submitApplication } from '@/backend/modules/mentor-application'
import { getUserFromAuthHeader } from '../../../backend/middleware/auth'

export const POST = withAuth(async (req: NextRequest, user) => {
  try {
    const body = await req.json()
    // Always inject user_id from auth â€” never trust the body
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
