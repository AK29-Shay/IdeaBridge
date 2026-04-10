/**
 * GET /api/blogs/mine
 * Returns ALL blog posts authored by the logged-in mentor,
 * including unpublished drafts. Mentors only.
 */
import { NextResponse } from 'next/server'
import { withRole } from '../../../backend/middleware/requireRole'
import { handleGetMyBlogs } from '../../../backend/controllers/blogController'
import { handleError } from '../../../backend/utils/helpers'

export const GET = withRole(['mentor'], async (_req, user) => {
  try {
    const blogs = await handleGetMyBlogs(user.id)
    return NextResponse.json({ data: blogs })
  } catch (e) {
    return handleError(e)
  }
})
