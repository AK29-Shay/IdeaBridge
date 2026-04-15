import { NextResponse } from 'next/server'
import { searchMentors } from '@/backend/modules/mentor'
import { getUserFromAuthHeader } from '../../../../backend/middleware/auth'

export async function GET(req: NextRequest) {
  try {
    const params = Object.fromEntries(req.nextUrl.searchParams.entries())
    const mentors = await handleMentorSearch(params)
    return NextResponse.json({ data: mentors, count: mentors.length })
  } catch (e) {
    return handleError(e)
  }
}
