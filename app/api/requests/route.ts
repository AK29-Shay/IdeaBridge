import { NextResponse } from 'next/server'
import { submitRequest } from '@/backend/modules/request'
import { getUserFromAuthHeader } from '../../../backend/middleware/auth'

export async function POST(request: Request) {
  try {
    const authorization = request.headers.get('authorization')
    const user = await getUserFromAuthHeader(authorization)
    if (!user) return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

    const body = await request.json()
    body.student_id = user.user.id
    const data = await submitRequest(body)
    return NextResponse.json(data)
  } catch (e: any) {
    return new NextResponse(JSON.stringify({ error: e.message || String(e) }), { status: 400 })
  }
}
