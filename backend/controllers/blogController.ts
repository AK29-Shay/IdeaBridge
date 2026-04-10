/**
 * blogController.ts
 * Validates and enforces blog rules:
 * - Only mentors can create / update / delete blogs
 * - Anyone can read published blogs
 */
import { createBlogSchema, updateBlogSchema } from '../models/schemas'
import {
  createBlog,
  getAllBlogs,
  getBlogById,
  getBlogsByAuthor,
  updateBlog,
  deleteBlog,
} from '../services/blogService'
import type { DbBlog } from '../models/types'

// ─── Create ───────────────────────────────────────────────────

export async function handleCreateBlog(
  author_id: string,
  payload: unknown
): Promise<DbBlog> {
  const validated = createBlogSchema.parse(payload)
  return createBlog({ ...validated, author_id })
}

// ─── Read (public) ────────────────────────────────────────────

export async function handleGetAllBlogs(tag?: string) {
  return getAllBlogs(tag)
}

export async function handleGetBlog(id: string) {
  const blog = await getBlogById(id)
  if (!blog) throw new Error('Blog post not found')
  return blog
}

/** Mentor's own blog list — includes unpublished */
export async function handleGetMyBlogs(author_id: string): Promise<DbBlog[]> {
  return getBlogsByAuthor(author_id)
}

// ─── Update ───────────────────────────────────────────────────

export async function handleUpdateBlog(
  author_id: string,
  blog_id: string,
  payload: unknown
): Promise<DbBlog> {
  const validated = updateBlogSchema.parse(payload)
  return updateBlog(blog_id, author_id, validated)
}

// ─── Delete ───────────────────────────────────────────────────

export async function handleDeleteBlog(
  author_id: string,
  blog_id: string
): Promise<void> {
  return deleteBlog(blog_id, author_id)
}
