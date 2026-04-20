import { NextResponse } from 'next/server'
import { createOrUpdateProfile, fetchProfile } from '@/backend/modules/profile'
import { getUserFromAuthHeader } from '../../../backend/middleware/auth'

/** GET /api/profile/me */
export const GET = withAuth(async (_req, user) => {
  try {
    const authorization = request.headers.get('authorization')
    const user = await getUserFromAuthHeader(authorization)
    if (!user) return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

    const body = await request.json()
    body.id = user.user.id
    const data = await createOrUpdateProfile(body)
    return NextResponse.json(data)
  } catch (e: any) {
    return new NextResponse(JSON.stringify({ error: e.message || String(e) }), { status: 400 })
  }
})

/** POST /api/profile/create */
export const POST = withAuth(async (req, user) => {
  try {
    const body = await req.json()
    const profile = await createOrUpdateProfile(user.id, body)
    return NextResponse.json({ data: profile }, { status: 201 })
  } catch (e) {
    return handleError(e)
  }
})

/** PATCH /api/profile/update */
export const PATCH = withAuth(async (req, user) => {
  try {
    const body = await req.json()
    const profile = await createOrUpdateProfile(user.id, body)
    return NextResponse.json({ data: profile })
  } catch (e) {
    return handleError(e)
  }
})
