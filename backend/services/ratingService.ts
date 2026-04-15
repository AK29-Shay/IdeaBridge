/**
 * ratingService.ts
 * Database operations for ratings.
 * After insert, the DB trigger automatically updates mentor reputation on profiles.
 */
import supabaseServer from '../config/supabaseServer'
import type { DbRating } from '../models/types'

// â”€â”€â”€ Create rating â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface CreateRatingPayload {
  request_id: string
  mentor_id:  string
  student_id: string
  rating:     number  // 1-5
  review?:    string
}

    // compute average
    if (agg) {
      const ratings = agg.map((r: any) => r.rating)
      const avg = ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length
      await supabaseServer.from('profiles').update({ reputation: avg }).eq('id', payload.mentor_id)
    }
    throw new Error(error.message)
  }

  return data
}

// â”€â”€â”€ Read ratings â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface RatingWithDetails extends DbRating {
  profiles?: { full_name: string } | null
}

/** All ratings for a mentor, joined with student name */
export async function getRatingsByMentor(mentor_id: string): Promise<RatingWithDetails[]> {
  const { data, error } = await supabaseServer
    .from('ratings')
    .select('*, profiles!ratings_student_id_fkey(full_name)')
    .eq('mentor_id', mentor_id)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

/** Check if a student has already rated a specific request */
export async function hasStudentRated(
  request_id: string,
  student_id: string
): Promise<boolean> {
  const { data, error } = await supabaseServer
    .from('ratings')
    .select('id')
    .eq('request_id', request_id)
    .eq('student_id', student_id)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data !== null
}
