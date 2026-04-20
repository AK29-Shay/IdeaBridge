import { NextResponse } from 'next/server'
import { submitRequest } from '@/backend/modules/request'
import { getUserFromAuthHeader } from '../../../backend/middleware/auth'

/** POST /api/requests/create â€” students only */
export const POST = withAuth(async (req: NextRequest, user) => {
  try {
    const profile = await getProfileByUserId(user.id)
    if (!profile || profile.role !== 'student') {
      return NextResponse.json({ error: 'Forbidden: only students can create requests' }, { status: 403 })
    }

    const body = await req.json()
    const request = await submitRequest(user.id, body)
    return NextResponse.json({ data: request }, { status: 201 })
  } catch (e) {
    return handleError(e)
  }
})

/** GET /api/requests/my â€” student views their own requests */
export const GET = withAuth(async (_req: NextRequest, user) => {
  try {
    const requests = await getStudentRequests(user.id)
    return NextResponse.json({ data: requests })
  } catch (e) {
    return handleError(e)
  }
})
