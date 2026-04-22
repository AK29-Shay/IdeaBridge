import { NextResponse } from 'next/server'
import { createOrUpdateProfile, fetchProfile } from '@/backend/modules/profile'
import { getUserFromAuthHeader } from '../../../backend/middleware/auth'
import { getErrorMessage } from '@/lib/errorMessage'

export async function POST(request: Request) {
  try {
    const authorization = request.headers.get('authorization')
    const user = await getUserFromAuthHeader(authorization)
    if (!user) return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

    const body = await request.json()
    body.id = user.user.id
    const data = await createOrUpdateProfile(body)
    return NextResponse.json(data)
  } catch (error: unknown) {
    return new NextResponse(JSON.stringify({ error: getErrorMessage(error, 'Failed to save profile.') }), { status: 400 })
  }
}

export async function GET(request: Request) {
  try {
    const authorization = request.headers.get('authorization')
    const user = await getUserFromAuthHeader(authorization)
    if (!user) return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

    const data = await fetchProfile(user.user.id)
    return NextResponse.json(data)
  } catch (error: unknown) {
    return new NextResponse(JSON.stringify({ error: getErrorMessage(error, 'Failed to load profile.') }), { status: 400 })
  }
}
