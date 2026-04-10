/**
 * helpers.ts
 * Shared utility functions used across the backend.
 */
import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

// ─── API response helpers ─────────────────────────────────────

/** Returns a clean 200 JSON response */
export function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ data }, { status })
}

/** Returns a clean error JSON response */
export function fail(message: string, status = 400): NextResponse {
  return NextResponse.json({ error: message }, { status })
}

/**
 * Converts any caught error into a clean API error response.
 * Handles ZodError (validation), strings, and generic Error objects.
 */
export function handleError(e: unknown): NextResponse {
  if (e instanceof ZodError) {
    const messages = e.errors.map((err) => `${err.path.join('.')}: ${err.message}`)
    return NextResponse.json(
      { error: 'Validation failed', details: messages },
      { status: 422 }
    )
  }
  if (e instanceof Error) {
    // Surface known constraint violations
    const msg = e.message
    if (msg.includes('duplicate') || msg.includes('unique')) {
      return NextResponse.json({ error: 'Resource already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: msg }, { status: 400 })
  }
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
}

// ─── Date helpers ─────────────────────────────────────────────

/** Returns ISO datetime string for N minutes from now */
export function minutesFromNow(minutes: number): string {
  return new Date(Date.now() + minutes * 60_000).toISOString()
}

/** Checks whether a given ISO timestamp has passed */
export function isExpired(isoTimestamp: string): boolean {
  return new Date(isoTimestamp).getTime() < Date.now()
}

// ─── Query helpers ────────────────────────────────────────────

/**
 * Parses a URL search parameter as an integer with a fallback default.
 */
export function parseIntParam(value: string | null, defaultVal: number): number {
  if (!value) return defaultVal
  const parsed = parseInt(value, 10)
  return isNaN(parsed) ? defaultVal : parsed
}
