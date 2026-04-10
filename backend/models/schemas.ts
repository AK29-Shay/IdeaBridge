/**
 * schemas.ts
 * Central Zod validation schemas for all IdeaBridge domain objects.
 * Controllers call .parse() to validate incoming payloads before hitting the DB.
 */
import { z } from 'zod'

// ─── SHARED ───────────────────────────────────────────────────

const urlOrEmpty = z.union([z.string().url(), z.literal('')]).optional()

// ─── PROFILE ──────────────────────────────────────────────────

export const studentProfileSchema = z.object({
  user_id:        z.string().uuid().optional(),
  role:           z.literal('student'),
  full_name:      z.string().min(1, 'Full name is required'),
  bio:            z.string().max(1000).optional(),
  skills:         z.array(z.string()).default([]),
  study_year:     z.string().optional(),
  faculty:        z.string().optional(),
  specialization: z.string().optional(),
  github:         urlOrEmpty,
  linkedin:       urlOrEmpty,
  profile_image:  urlOrEmpty,
})

export const mentorProfileSchema = z.object({
  user_id:                    z.string().uuid().optional(),
  role:                       z.literal('mentor'),
  full_name:                  z.string().min(1, 'Full name is required'),
  bio:                        z.string().max(1000).optional(),
  skills:                     z.array(z.string()).default([]),
  academic_year:              z.string().optional(),
  faculty:                    z.string().optional(),
  availability:               z.enum(['Full-time', 'Part-time', 'Evenings']).optional(),
  availability_status:        z
    .enum(['Available Now', 'Available in 1-2 days', 'Busy', 'On Leave'])
    .optional(),
  years_experience:           z.number().int().min(0).optional(),
  github:                     urlOrEmpty,
  linkedin:                   urlOrEmpty,
  portfolio_links:            z.array(z.string().url()).default([]),
  availability_calendar_note: z.string().optional(),
  profile_image:              urlOrEmpty,
})

/** Union schema — role discriminates student vs mentor */
export const profileSchema = z.discriminatedUnion('role', [
  studentProfileSchema,
  mentorProfileSchema,
])

// ─── HELP REQUESTS ────────────────────────────────────────────

export const REQUEST_STATUSES = [
  'open',
  'accepted',
  'in_progress',
  'completed',
  'rejected',
  'closed',
] as const

export type RequestStatus = (typeof REQUEST_STATUSES)[number]

/** Valid status transitions: key → allowed next states */
export const STATUS_TRANSITIONS: Record<RequestStatus, RequestStatus[]> = {
  open:        ['accepted', 'rejected', 'closed'],
  accepted:    ['in_progress', 'rejected', 'closed'],
  in_progress: ['completed', 'closed'],
  completed:   ['closed'],
  rejected:    ['closed'],
  closed:      [],
}

export const createRequestSchema = z.object({
  title:        z.string().min(3, 'Title must be at least 3 characters'),
  request_type: z.enum(['full_project', 'specific_idea']),
  description:  z.string().min(10, 'Description must be at least 10 characters'),
  domain:       z.string().min(1, 'Domain is required'),
  deadline:     z.string().datetime({ offset: true }).optional(),
  // student_id is injected from auth, not from the request body
})

export const updateStatusSchema = z.object({
  request_id: z.string().uuid(),
  status:     z.enum(REQUEST_STATUSES),
})

// ─── RATINGS ──────────────────────────────────────────────────

export const createRatingSchema = z.object({
  request_id: z.string().uuid(),
  mentor_id:  z.string().uuid(),
  rating:     z.number().int().min(1).max(5),
  review:     z.string().max(1000).optional(),
  // student_id injected from auth
})

// ─── BLOGS ────────────────────────────────────────────────────

export const createBlogSchema = z.object({
  title:   z.string().min(3, 'Title must be at least 3 characters'),
  content: z.string().min(20, 'Content is too short'),
  tags:    z.array(z.string()).default([]),
  published: z.boolean().default(true),
})

export const updateBlogSchema = createBlogSchema.partial()

// ─── NOTIFICATIONS ────────────────────────────────────────────

export const createNotificationSchema = z.object({
  user_id: z.string().uuid(),
  type:    z.string().min(1),
  title:   z.string().optional(),
  message: z.string().optional(),
  payload: z.record(z.unknown()).optional(),
})

// ─── OTP / 2FA ────────────────────────────────────────────────

export const sendOtpSchema = z.object({
  user_id: z.string().uuid(),
})

export const verifyOtpSchema = z.object({
  user_id: z.string().uuid(),
  otp:     z.string().length(6, 'OTP must be 6 digits'),
})

// ─── MENTOR SEARCH ────────────────────────────────────────────

export const mentorSearchSchema = z.object({
  skills:              z.string().optional(), // comma-separated
  availability:        z.enum(['Full-time', 'Part-time', 'Evenings']).optional(),
  availability_status: z
    .enum(['Available Now', 'Available in 1-2 days', 'Busy', 'On Leave'])
    .optional(),
  min_rating: z.coerce.number().min(0).max(5).optional(),
  limit:      z.coerce.number().int().min(1).max(50).default(20),
  offset:     z.coerce.number().int().min(0).default(0),
})

// ─── MENTOR AVAILABILITY ──────────────────────────────────────

export const updateAvailabilitySchema = z.object({
  availability:               z.enum(['Full-time', 'Part-time', 'Evenings']).optional(),
  availability_status:        z
    .enum(['Available Now', 'Available in 1-2 days', 'Busy', 'On Leave'])
    .optional(),
  availability_calendar_note: z.string().max(500).optional(),
})

// ─── MENTOR APPLICATION ───────────────────────────────────────

export const mentorApplicationSchema = z.object({
  user_id:       z.string().uuid(),
  full_name:     z.string().min(1, 'Full name is required'),
  faculty:       z.string().min(1, 'Faculty is required'),
  academic_year: z.string().min(1, 'Academic year is required'),
  skills:        z.array(z.string()).min(1, 'At least one skill is required'),
  bio:           z.string().min(20, 'Bio must be at least 20 characters'),
  linkedin:      urlOrEmpty,
  github:        urlOrEmpty,
  motivation:    z.string().min(20, 'Please explain your motivation (min 20 chars)'),
})
