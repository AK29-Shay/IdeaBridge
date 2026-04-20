-- ============================================================
-- IdeaBridge: Idea & Guidance Module - Supabase SQL Schema
-- Run this in your Supabase SQL Editor (supabase.com/dashboard)
-- ============================================================

-- Step 1: Create custom ENUM types
CREATE TYPE post_mode AS ENUM ('request', 'post');
CREATE TYPE post_type AS ENUM ('full_project', 'idea', 'ai_driven', 'campus_req');

-- Step 2: Profiles table (extends Supabase Auth)
-- This holds role and avatar information for each user.
CREATE TABLE IF NOT EXISTS public.profiles (
  id           UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name    TEXT,
  avatar_url   TEXT,
  role         TEXT        NOT NULL DEFAULT 'Student' CHECK (role IN ('Student', 'Mentor', 'Admin')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Trigger: Auto-create a profile row on new user sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================================
-- Step 3: Posts Table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.posts (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_mode       post_mode   NOT NULL DEFAULT 'post',
  post_type       post_type   NOT NULL DEFAULT 'idea',
  title           TEXT        NOT NULL,
  description     TEXT,
  tech_stack      TEXT[],                    -- Array of tags e.g. ['Next.js', 'Supabase']
  dynamic_content JSONB       NOT NULL DEFAULT '{}', -- Flexible variant-specific fields
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Index for fast user-based lookups
CREATE INDEX IF NOT EXISTS posts_user_id_idx ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS posts_created_at_idx ON public.posts(created_at DESC);
-- GIN index for efficient JSONB queries
CREATE INDEX IF NOT EXISTS posts_dynamic_content_idx ON public.posts USING GIN(dynamic_content);


-- ============================================================
-- Step 4: Comments Table (Self-Referencing for Recursion)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.comments (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id           UUID        NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id           UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_comment_id UUID        REFERENCES public.comments(id) ON DELETE CASCADE, -- NULL = top-level
  content           TEXT        NOT NULL,
  is_accepted       BOOLEAN     NOT NULL DEFAULT FALSE,
  upvotes           INTEGER     NOT NULL DEFAULT 0 CHECK (upvotes >= 0),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Indexes for fast thread fetching
CREATE INDEX IF NOT EXISTS comments_post_id_idx ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS comments_parent_id_idx ON public.comments(parent_comment_id);


-- ============================================================
-- Step 5: Row Level Security (RLS) Policies
-- ============================================================

-- PROFILES
CREATE POLICY "Profiles are viewable by everyone authenticated"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- POSTS: Anyone authenticated can read
CREATE POLICY "Authenticated users can read all posts"
  ON public.posts FOR SELECT
  TO authenticated
  USING (TRUE);

-- POSTS: Authenticated users can create posts
CREATE POLICY "Authenticated users can create posts"
  ON public.posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- POSTS: Only the post owner can update/delete their posts
CREATE POLICY "Post owners can update their own posts"
  ON public.posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Post owners can delete their own posts"
  ON public.posts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- COMMENTS: Anyone authenticated can read
CREATE POLICY "Authenticated users can read all comments"
  ON public.comments FOR SELECT
  TO authenticated
  USING (TRUE);

-- COMMENTS: Authenticated users can create comments
CREATE POLICY "Authenticated users can insert comments"
  ON public.comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- COMMENTS: Only the post OWNER can accept an answer (set is_accepted = TRUE)
-- This uses a subquery to verify that the authenticated user owns the parent post.
CREATE POLICY "Post owner can accept a comment answer"
  ON public.comments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.posts
      WHERE posts.id = comments.post_id
        AND posts.user_id = auth.uid()
    )
  );

-- COMMENTS: Comment author can delete their own comment
CREATE POLICY "Comment authors can delete own comments"
  ON public.comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);


-- ============================================================
-- Step 6: Database View/RPC for Recursive Thread Fetching
-- A PostgreSQL recursive CTE that fetches the entire thread
-- for a given post_id and joins with user profile data.
-- ============================================================
CREATE OR REPLACE FUNCTION public.fetch_thread(p_post_id UUID)
RETURNS TABLE (
  id                UUID,
  post_id           UUID,
  user_id           UUID,
  parent_comment_id UUID,
  content           TEXT,
  is_accepted       BOOLEAN,
  upvotes           INTEGER,
  created_at        TIMESTAMPTZ,
  author_name       TEXT,
  author_avatar     TEXT,
  author_role       TEXT,
  depth             INTEGER,
  path              UUID[]
) AS $$
WITH RECURSIVE comment_tree AS (
  -- Base case: top-level comments (no parent)
  SELECT
    c.id,
    c.post_id,
    c.user_id,
    c.parent_comment_id,
    c.content,
    c.is_accepted,
    c.upvotes,
    c.created_at,
    0 AS depth,
    ARRAY[c.id] AS path
  FROM public.comments c
  WHERE c.post_id = p_post_id
    AND c.parent_comment_id IS NULL

  UNION ALL

  -- Recursive case: child comments
  SELECT
    c.id,
    c.post_id,
    c.user_id,
    c.parent_comment_id,
    c.content,
    c.is_accepted,
    c.upvotes,
    c.created_at,
    ct.depth + 1,
    ct.path || c.id
  FROM public.comments c
  INNER JOIN comment_tree ct ON c.parent_comment_id = ct.id
  WHERE c.post_id = p_post_id
)
SELECT
  ct.id,
  ct.post_id,
  ct.user_id,
  ct.parent_comment_id,
  ct.content,
  ct.is_accepted,
  ct.upvotes,
  ct.created_at,
  COALESCE(p.full_name, 'Anonymous')  AS author_name,
  p.avatar_url                         AS author_avatar,
  COALESCE(p.role, 'Student')          AS author_role,
  ct.depth,
  ct.path
FROM comment_tree ct
LEFT JOIN public.profiles p ON p.id = ct.user_id
ORDER BY ct.path;
$$ LANGUAGE sql STABLE SECURITY DEFINER;
