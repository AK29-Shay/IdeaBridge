/**
 * types.ts
 * TypeScript type definitions derived from Zod schemas + DB shapes.
 * Import these throughout the codebase for type safety.
 */
import type { z } from 'zod'
import type {
  studentProfileSchema,
  mentorProfileSchema,
  createRequestSchema,
  createRatingSchema,
  createBlogSchema,
  createNotificationSchema,
  RequestStatus,
} from './schemas'

// ─── PROFILE TYPES ────────────────────────────────────────────

export type StudentProfileInput = z.infer<typeof studentProfileSchema>
export type MentorProfileInput = z.infer<typeof mentorProfileSchema>

/** Shape returned from the profiles DB table */
export interface DbProfile {
  id: string
  user_id: string
  role: 'student' | 'mentor'
  full_name: string
  bio?: string | null
  skills: string[]
  linkedin?: string | null
  github?: string | null
  profile_image?: string | null

  // student fields
  study_year?: string | null
  faculty?: string | null
  specialization?: string | null

  // mentor fields
  academic_year?: string | null
  availability?: string | null
  availability_status?: string | null
  years_experience?: number | null
  portfolio_links?: string[] | null
  availability_calendar_note?: string | null

  reputation: number
  rating_count: number
  created_at: string
  updated_at: string
}

// ─── HELP REQUEST TYPES ───────────────────────────────────────

export type CreateRequestInput = z.infer<typeof createRequestSchema>
export { RequestStatus }

export interface DbHelpRequest {
  id: string
  student_id: string
  mentor_id?: string | null
  title: string
  request_type: 'full_project' | 'specific_idea'
  description: string
  domain: string
  deadline?: string | null
  status: RequestStatus
  updated_by?: string | null
  created_at: string
  updated_at: string
}

// ─── RATING TYPES ─────────────────────────────────────────────

export type CreateRatingInput = z.infer<typeof createRatingSchema>

export interface DbRating {
  id: string
  request_id: string
  mentor_id: string
  student_id: string
  rating: number
  review?: string | null
  created_at: string
}

// ─── BLOG TYPES ───────────────────────────────────────────────

export type CreateBlogInput = z.infer<typeof createBlogSchema>

export interface DbBlog {
  id: string
  author_id: string
  title: string
  content: string
  tags: string[]
  published: boolean
  created_at: string
  updated_at: string
}

// ─── NOTIFICATION TYPES ───────────────────────────────────────

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>

export type NotificationType =
  | 'request_accepted'
  | 'request_rejected'
  | 'request_status_updated'
  | 'new_rating'
  | 'mentor_verified'

export interface DbNotification {
  id: string
  user_id: string
  type: string
  title?: string | null
  message?: string | null
  payload?: Record<string, unknown> | null
  read: boolean
  created_at: string
}

// ─── OTP TYPES ────────────────────────────────────────────────

export interface DbOtp {
  id: string
  user_id: string
  otp: string
  expires_at: string
  attempts: number
  created_at: string
}

// ─── UTILITY ──────────────────────────────────────────────────

/** Standard JSON API response shape */
export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  message?: string
}
