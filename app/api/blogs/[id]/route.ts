/**
 * GET    /api/blogs/[id]  → fetch a single blog post (public, includes author info)
 * PATCH  /api/blogs/[id]  → mentor updates their own blog post
 * DELETE /api/blogs/[id]  → mentor deletes their own blog post
 */
import { NextRequest, NextResponse } from 'next/server'
import { withRole } from '../../../../backend/middleware/requireRole'
import {
  handleGetBlog,
  handleUpdateBlog,
  handleDeleteBlog,
} from '../../../../backend/controllers/blogController'
import { handleError } from '../../../../backend/utils/helpers'

/** GET /api/blogs/[id] — public */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const blog = await handleGetBlog(id)
    return NextResponse.json({ data: blog })
  } catch (e) {
    return handleError(e)
  }
}

/** PATCH /api/blogs/[id] — mentor (own blog) only */
export const PATCH = withRole(['mentor'], async (req: NextRequest, user, _profile, ctx) => {
  try {
    const { id } = await ctx!.params
    const body = await req.json()
    const blog = await handleUpdateBlog(user.id, id, body)
    return NextResponse.json({ data: blog })
  } catch (e) {
    return handleError(e)
  }
})

/** DELETE /api/blogs/[id] — mentor (own blog) only */
export const DELETE = withRole(['mentor'], async (_req: NextRequest, user, _profile, ctx) => {
  try {
    const { id } = await ctx!.params
    await handleDeleteBlog(user.id, id)
    return NextResponse.json({ message: 'Blog post deleted' })
  } catch (e) {
    return handleError(e)
  }
})
