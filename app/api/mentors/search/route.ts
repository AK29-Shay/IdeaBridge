/**
 * GET /api/mentors/search
 *
 * Query params (all optional):
 *   skills              comma-separated, e.g. "React,TypeScript"
 *   availability        Full-time | Part-time | Evenings
 *   availability_status Available Now | Available in 1-2 days | Busy | On Leave
 *   min_rating          0–5
 *   limit               default 20, max 50
 *   offset              default 0
 *
 * Public — no auth required so students can browse before signing in.
 */
import { NextRequest, NextResponse } from 'next/server'
import { handleMentorSearch } from '../../../../backend/controllers/mentorController'
import { handleError } from '../../../../backend/utils/helpers'

export async function GET(req: NextRequest) {
  try {
    const params = Object.fromEntries(req.nextUrl.searchParams.entries())
    const mentors = await handleMentorSearch(params)
    return NextResponse.json({ data: mentors, count: mentors.length })
  } catch (e) {
    return handleError(e)
  }
}
