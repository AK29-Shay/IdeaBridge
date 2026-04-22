import { NextResponse } from 'next/server'
import { getMentorProfileById, listMentorProfiles } from '@/backend/services/profileService'
import { getErrorMessage } from '@/lib/errorMessage'

function toMentorPayload(profile: {
  id: string
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  skills: string[] | null
  availability: string | null
  availability_status: string | null
  years_experience: number | null
  linked_in: string | null
  github_url: string | null
  portfolio_links: string[] | null
  availability_calendar_note: string | null
  reputation: number | null
}) {
  return {
    id: profile.id,
    fullName: profile.full_name ?? 'Mentor',
    rating: Number(profile.reputation) || 4.5,
    profile: {
      bio: profile.bio ?? '',
      skills: profile.skills ?? [],
      availability:
        profile.availability === 'Part-time' || profile.availability === 'Evenings'
          ? profile.availability
          : 'Full-time',
      availabilityStatus: profile.availability_status ?? 'Available in 1-2 days',
      yearsExperience: profile.years_experience ?? 0,
      linkedIn: profile.linked_in ?? undefined,
      github: profile.github_url ?? undefined,
      portfolioLinks: profile.portfolio_links ?? [],
      availabilityCalendarNote: profile.availability_calendar_note ?? undefined,
      avatarUrl: profile.avatar_url ?? undefined,
    },
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    if (id) {
      const mentor = await getMentorProfileById(id)
      if (!mentor) {
        return new NextResponse(JSON.stringify({ error: 'Mentor not found' }), { status: 404 })
      }
      return NextResponse.json(toMentorPayload(mentor))
    }

    const query = url.searchParams.get('q') || undefined
    const skill = url.searchParams.get('skill') || undefined
    const availability = url.searchParams.get('availability') || undefined
    const limitRaw = Number(url.searchParams.get('limit'))
    const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? limitRaw : undefined
    const data = await listMentorProfiles({ search: query, skill, availability, limit })
    return NextResponse.json(data.map(toMentorPayload))
  } catch (error: unknown) {
    return new NextResponse(JSON.stringify({ error: getErrorMessage(error, 'Failed to search mentors.') }), { status: 400 })
  }
}
