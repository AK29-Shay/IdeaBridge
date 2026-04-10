/**
 * ratingService.ts
 * Database operations for ratings.
 * After insert, the DB trigger automatically updates mentor reputation on profiles.
 */
import supabaseServer from '../config/supabaseServer'
import type { DbRating } from '../models/types'

// ─── Create rating ────────────────────────────────────────────

export interface CreateRatingPayload {
  request_id: string
  mentor_id:  string
  student_id: string
  rating:     number  // 1-5
  review?:    string
}

/**
 * Submits a new rating.
 * Guards against duplicate ratings for the same request (DB UNIQUE constraint).
 * The DB trigger 'after_rating_insert' updates mentor reputation automatically.
 */
export async function addRating(payload: CreateRatingPayload): Promise<DbRating> {
  const { data, error } = await supabaseServer
    .from('ratings')
    .insert(payload)
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      throw new Error('You have already rated this request')
    }
    throw new Error(error.message)
  }

  return data
}

// ─── Read ratings ─────────────────────────────────────────────

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
