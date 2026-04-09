import { NextResponse } from 'next/server'
import { submitApplication } from '../../../backend/controllers/mentorApplicationController'
import { getUserFromAuthHeader } from '../../../backend/middleware/auth'

export async function POST(request: Request) {
  try {
    const authorization = request.headers.get('authorization')
    const user = await getUserFromAuthHeader(authorization)
    if (!user) return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

    const body = await request.json()
    body.user_id = user.user.id
    const data = await submitApplication(body)
    return NextResponse.json(data)
  } catch (e: any) {
    const status = e?.code === 'DUPLICATE' ? 409 : 400
    return new NextResponse(JSON.stringify({ error: e.message || String(e) }), { status })
  }
}
