/**
 * POST /api/profile/create  → create or update the caller's profile
 * GET  /api/profile/me      → fetch the caller's own profile
 *
 * Note: Both operations live here. A PATCH /api/profile/update
 * also lives in this file (PATCH handler).
 */
import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '../../../backend/middleware/auth'
import {
  createOrUpdateProfile,
  fetchProfile,
} from '../../../backend/controllers/profileController'
import { handleError } from '../../../backend/utils/helpers'

/** GET /api/profile/me */
export const GET = withAuth(async (_req, user) => {
  try {
    const profile = await fetchProfile(user.id)
    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    return NextResponse.json({ data: profile })
  } catch (e) {
    return handleError(e)
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
