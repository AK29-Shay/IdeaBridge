import { NextResponse } from 'next/server'
import { searchMentors } from '../../../../backend/controllers/mentorController'
import { getUserFromAuthHeader } from '../../../../backend/middleware/auth'

export async function GET(request: Request) {
  try {
    const authorization = request.headers.get('authorization')
    const user = await getUserFromAuthHeader(authorization)
    if (!user) return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

    const url = new URL(request.url)
    const skill = url.searchParams.get('skill') || undefined
    const data = await searchMentors({ skill })
    return NextResponse.json(data)
  } catch (e: any) {
    return new NextResponse(JSON.stringify({ error: e.message || String(e) }), { status: 400 })
  }
}
