import supabaseServer from '../config/supabaseServer'
import type { User } from '@supabase/supabase-js'

function decodeJwtPayload(token: string) {
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'))
    return payload
  } catch (e) {
    return null
  }
}

export async function getUserFromAuthHeader(authorization?: string | null) {
  if (!authorization) return null
  const match = authorization.match(/Bearer (.+)/)
  if (!match) return null
  const token = match[1]
  const payload = decodeJwtPayload(token)
  if (!payload || !payload.sub) return null
  if (payload.exp && typeof payload.exp === 'number') {
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp < now) return null
  }

  // Use admin API to fetch user by id. Requires service role key.
  try {
    // @ts-ignore - admin namespace used with service role
    const { data, error } = await supabaseServer.auth.admin.getUserById(payload.sub)
    if (error || !data?.user) return null
    return { user: data.user as User, token }
  } catch (e) {
    return null
  }
}

export function requireRole(userProfile: any, allowed: string[]) {
  if (!userProfile) return false
  return allowed.includes(userProfile.role)
}
