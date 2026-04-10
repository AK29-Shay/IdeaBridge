/**
 * POST /api/requests/create  → student creates a help request
 * GET  /api/requests/my      → student views their own requests
 */
import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '../../../backend/middleware/auth'
import { getProfileByUserId } from '../../../backend/services/profileService'
import {
  submitRequest,
  getStudentRequests,
} from '../../../backend/controllers/requestController'
import { handleError } from '../../../backend/utils/helpers'

/** POST /api/requests/create — students only */
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

/** GET /api/requests/my — student views their own requests */
export const GET = withAuth(async (_req: NextRequest, user) => {
  try {
    const requests = await getStudentRequests(user.id)
    return NextResponse.json({ data: requests })
  } catch (e) {
    return handleError(e)
  }
})
