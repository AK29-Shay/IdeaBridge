/**
 * blogService.ts
 * Database operations for mentor blog posts.
 */
import supabaseServer from '../config/supabaseServer'
import type { DbBlog } from '../models/types'

// ─── Create ───────────────────────────────────────────────────

export interface CreateBlogPayload {
  author_id: string
  title:     string
  content:   string
  tags?:     string[]
  published?: boolean
}

export async function createBlog(payload: CreateBlogPayload): Promise<DbBlog> {
  const { data, error } = await supabaseServer
    .from('blogs')
    .insert({ ...payload, tags: payload.tags ?? [], published: payload.published ?? true })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

// ─── Read ─────────────────────────────────────────────────────

/**
 * All published blog posts — optionally filtered by tag.
 * Joined with author profile (full_name, profile_image).
 */
export async function getAllBlogs(tag?: string): Promise<(DbBlog & { author?: unknown })[]> {
  let query = supabaseServer
    .from('blogs')
    .select('*, author:profiles!blogs_author_id_fkey(full_name, profile_image, faculty)')
    .eq('published', true)
    .order('created_at', { ascending: false })

  if (tag) {
    query = query.contains('tags', [tag])
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data ?? []
}

/** Single blog post by id */
export async function getBlogById(id: string): Promise<(DbBlog & { author?: unknown }) | null> {
  const { data, error } = await supabaseServer
    .from('blogs')
    .select('*, author:profiles!blogs_author_id_fkey(full_name, profile_image, faculty)')
    .eq('id', id)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data
}

/** Blogs authored by a specific mentor (including unpublished) */
export async function getBlogsByAuthor(author_id: string): Promise<DbBlog[]> {
  const { data, error } = await supabaseServer
    .from('blogs')
    .select('*')
    .eq('author_id', author_id)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

// ─── Update ───────────────────────────────────────────────────

export type UpdateBlogPayload = Partial<Omit<DbBlog, 'id' | 'author_id' | 'created_at' | 'updated_at'>>

/**
 * Updates a blog post. Verifies ownership first.
 * Throws 403-style error if the caller is not the author.
 */
export async function updateBlog(
  id: string,
  author_id: string,
  updates: UpdateBlogPayload
): Promise<DbBlog> {
  // Ownership check
  const existing = await getBlogById(id)
  if (!existing) throw new Error('Blog post not found')
  if ((existing as DbBlog).author_id !== author_id) throw new Error('Forbidden: not your blog post')

  const { data, error } = await supabaseServer
    .from('blogs')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

// ─── Delete ───────────────────────────────────────────────────

/** Deletes a blog post after verifying ownership */
export async function deleteBlog(id: string, author_id: string): Promise<void> {
  const existing = await getBlogById(id)
  if (!existing) throw new Error('Blog post not found')
  if ((existing as DbBlog).author_id !== author_id) throw new Error('Forbidden: not your blog post')

  const { error } = await supabaseServer.from('blogs').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
