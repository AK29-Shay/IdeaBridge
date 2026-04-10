/**
 * auth.ts – Auth middleware
 *
 * getUserFromRequest()   – validate Bearer token, return Supabase User or null
 * getUserFromAuthHeader() – legacy helper (kept for backward compat)
 * requireRole()          – check profile role against an allowed list
 * withAuth()             – HOF wrapper: handles 401 automatically, forwards route ctx
 */
import { NextRequest, NextResponse } from 'next/server'
import supabaseServer from '../config/supabaseServer'
import type { User } from '@supabase/supabase-js'

// ─── Types ────────────────────────────────────────────────────

type RouteContext = { params: Promise<Record<string, string>> }

type AuthedHandler = (
  req: NextRequest,
  user: User,
  ctx?: RouteContext
) => Promise<NextResponse>

// ─── Token helpers ────────────────────────────────────────────

function extractToken(authorization: string | null): string | null {
  if (!authorization) return null
  const match = authorization.match(/^Bearer\s+(.+)$/i)
  return match ? match[1] : null
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    return JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'))
  } catch {
    return null
  }
}

function isTokenExpired(payload: Record<string, unknown>): boolean {
  const exp = payload.exp
  if (typeof exp !== 'number') return false
  return exp < Math.floor(Date.now() / 1000)
}

// ─── Core auth resolution ─────────────────────────────────────

/**
 * Resolves a Supabase User from a Next.js request's Authorization header.
 * Returns null if the token is missing, malformed, expired, or invalid.
 */
export async function getUserFromRequest(req: NextRequest | Request): Promise<User | null> {
  const authorization = req.headers.get('authorization')
  const token = extractToken(authorization)
  if (!token) return null

  const payload = decodeJwtPayload(token)
  if (!payload || !payload.sub) return null
  if (isTokenExpired(payload)) return null

  try {
    // @ts-expect-error – admin is available when using service role key
    const { data, error } = await supabaseServer.auth.admin.getUserById(payload.sub as string)
    if (error || !data?.user) return null
    return data.user
  } catch {
    return null
  }
}

/**
 * Legacy helper – accepts a raw authorization string.
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
    // @ts-expect-error – admin namespace requires service role key
    const { data, error } = await supabaseServer.auth.admin.getUserById(payload.sub as string)
    if (error || !data?.user) return null
    return { user: data.user, token }
  } catch {
    return null
  }
}

// ─── Role guard ───────────────────────────────────────────────

/**
 * Returns true if the given DB profile's role is in the allowed list.
 */
export function requireRole(profile: { role: string } | null, allowed: string[]): boolean {
  if (!profile) return false
  return allowed.includes(profile.role)
}

// ─── withAuth wrapper ─────────────────────────────────────────

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
