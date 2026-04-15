/**
 * auth.ts â€“ Auth middleware
 *
 * getUserFromRequest()   â€“ validate Bearer token, return Supabase User or null
 * getUserFromAuthHeader() â€“ legacy helper (kept for backward compat)
 * requireRole()          â€“ check profile role against an allowed list
 * withAuth()             â€“ HOF wrapper: handles 401 automatically, forwards route ctx
 */
import { NextRequest, NextResponse } from 'next/server'
import supabaseServer from '../config/supabaseServer'
import type { User } from '@supabase/supabase-js'

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

type RouteContext = { params: Promise<Record<string, string>> }

type AuthedHandler = (
  req: NextRequest,
  user: User,
  ctx?: RouteContext
) => Promise<NextResponse>

// â”€â”€â”€ Token helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function extractToken(authorization: string | null): string | null {
  if (!authorization) return null
  const match = authorization.match(/^Bearer\s+(.+)$/i)
  return match ? match[1] : null
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
    const payload = JSON.parse(Buffer.from(padded, 'base64').toString('utf8'))
    return payload
  } catch (e) {
    return null
  }
}

export async function getUserFromAuthHeader(authorization?: string | null) {
  if (!authorization) return null
  const match = authorization.match(/Bearer\s+(.+)/i)
  const token = match ? match[1] : authorization.trim()
  if (!token) return null
  const payload = decodeJwtPayload(token)
  if (!payload || !payload.sub) return null
  if (isTokenExpired(payload)) return null

  try {
    // @ts-ignore - admin namespace used with service role
    const { data, error } = await supabaseServer.auth.admin.getUserById(payload.sub)
    if (error || !data?.user) return null
    return { user: data.user as User, token }
  } catch (e) {
    return null
  }
}

/**
 * Legacy helper â€“ accepts a raw authorization string.
 * Kept for backward compatibility with existing route files.
 */
export async function getUserFromAuthHeader(
  authorization?: string | null
): Promise<{ user: User; token: string } | null> {
  const token = extractToken(authorization ?? null)
  if (!token) return null

  const payload = decodeJwtPayload(token)
  if (!payload || !payload.sub) return null
  if (isTokenExpired(payload)) return null

  try {
    // @ts-expect-error â€“ admin namespace requires service role key
    const { data, error } = await supabaseServer.auth.admin.getUserById(payload.sub as string)
    if (error || !data?.user) return null
    return { user: data.user, token }
  } catch {
    return null
  }
}

// â”€â”€â”€ Role guard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Returns true if the given DB profile's role is in the allowed list.
 */
export function requireRole(profile: { role: string } | null, allowed: string[]): boolean {
  if (!profile) return false
  return allowed.includes(profile.role)
}

// â”€â”€â”€ withAuth wrapper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Wraps a Next.js API route handler with authentication.
 * The handler only runs if the user is authenticated; otherwise returns 401.
 * Forwards the route context (dynamic params) as an optional 3rd argument.
 *
 * @example
 * export const GET = withAuth(async (req, user) => {
 *   return NextResponse.json({ id: user.id })
 * })
 *
 * // Dynamic route with params:
 * export const GET = withAuth(async (req, user, ctx) => {
 *   const { id } = await ctx!.params
 *   return NextResponse.json({ id })
 * })
 */
export function withAuth(handler: AuthedHandler) {
  return async (req: NextRequest, ctx?: RouteContext): Promise<NextResponse> => {
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return handler(req, user, ctx)
  }
}
