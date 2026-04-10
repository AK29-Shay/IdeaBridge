import { NextResponse } from 'next/server'
import { submitRating } from '@/backend/modules/rating'
import { getUserFromAuthHeader } from '../../../backend/middleware/auth'

export async function POST(request: Request) {
  try {
    const authorization = request.headers.get('authorization')
    const user = await getUserFromAuthHeader(authorization)
    if (!user) return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

    const body = await request.json()
    // ensure student identity
    body.student_id = user.user.id
    const data = await submitRating(body)
    return NextResponse.json(data)
  } catch (e: any) {
    return new NextResponse(JSON.stringify({ error: e.message || String(e) }), { status: 400 })
  }
}
