/**
 * requireRole.ts
 * withRole() – Higher-order wrapper that adds both auth + role enforcement.
 *
 * Usage (regular route):
 *   export const POST = withRole(['mentor'], async (req, user, profile) => { ... })
 *
 * Usage (dynamic [id] route — pass route context as 4th arg):
 *   export const DELETE = withRole(['mentor'], async (req, user, profile, ctx) => {
 *     const { id } = await ctx!.params
 *   })
 */
import { NextRequest, NextResponse } from 'next/server'
import type { User } from '@supabase/supabase-js'
import { getUserFromRequest } from './auth'
import { getProfileByUserId } from '../services/profileService'
import type { DbProfile } from '../models/types'

type RouteContext = { params: Promise<Record<string, string>> }

type RoleHandler = (
  req: NextRequest,
  user: User,
  profile: DbProfile,
  ctx?: RouteContext
) => Promise<NextResponse>

/**
 * Wraps a Next.js API handler with authentication + role checking.
 * If the user's profile role is not in `allowedRoles`, returns 403.
 * Forwards the route context (dynamic params) as an optional 4th argument.
 */
export function withRole(allowedRoles: string[], handler: RoleHandler) {
  return async (req: NextRequest, ctx?: RouteContext): Promise<NextResponse> => {
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await getProfileByUserId(user.id)
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    if (!allowedRoles.includes(profile.role)) {
      return NextResponse.json(
        { error: `Forbidden: requires role ${allowedRoles.join(' or ')}` },
        { status: 403 }
      )
    }

    return handler(req, user, profile, ctx)
  }
}
