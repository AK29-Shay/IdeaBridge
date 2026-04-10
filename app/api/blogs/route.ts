/**
 * GET  /api/blogs        → list all published blogs (public, with optional ?tag= filter)
 * POST /api/blogs        → mentor creates a new blog post
 */
import { NextRequest, NextResponse } from 'next/server'
import { withRole } from '../../../backend/middleware/requireRole'
import {
  handleGetAllBlogs,
  handleCreateBlog,
} from '../../../backend/controllers/blogController'
import { handleError } from '../../../backend/utils/helpers'

/** GET /api/blogs — public */
export async function GET(req: NextRequest) {
  try {
    const tag = req.nextUrl.searchParams.get('tag') ?? undefined
    const blogs = await handleGetAllBlogs(tag)
    return NextResponse.json({ data: blogs, count: blogs.length })
  } catch (e) {
    return handleError(e)
  }
}

/** POST /api/blogs — mentors only */
export const POST = withRole(['mentor'], async (req: NextRequest, user) => {
  try {
    const body = await req.json()
    const blog = await handleCreateBlog(user.id, body)
    return NextResponse.json({ data: blog }, { status: 201 })
  } catch (e) {
    return handleError(e)
  }
})
