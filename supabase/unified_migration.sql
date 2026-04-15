-- ============================================================
-- IdeaBridge: UNIFIED DATABASE MIGRATION
-- Generated: Phase 3 Integration — All four modules combined
--
-- HOW TO RUN:
-- 1. Go to: https://supabase.com/dashboard/project/iryxlumqtynztjwpqacb/sql/new
-- 2. Paste this entire file and click "Run"
-- 3. All tables, policies, triggers, and RPC functions will be created
-- ============================================================


-- ============================================================
-- SECTION 1: ENUMS
-- ============================================================
DO $$ BEGIN
  CREATE TYPE post_mode AS ENUM ('request', 'post');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE post_type AS ENUM ('full_project', 'idea', 'ai_driven', 'campus_req');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ============================================================
-- SECTION 2: PROFILES
-- (Member 1 – sneha-dhaya-IT | Auth & User Management)
-- Unified: merges both schemas into one canonical table.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id                UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name         TEXT,
  avatar_url        TEXT,
  bio               TEXT,
  skills            TEXT[],
  availability      TEXT,
  role              TEXT        NOT NULL DEFAULT 'Student' CHECK (role IN ('Student', 'Mentor', 'Admin')),
  reputation        NUMERIC     DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Auto-create profile row on new Supabase Auth sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at on profile change
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ============================================================
-- SECTION 3: MENTOR APPLICATIONS
-- (Member 1 – sneha-dhaya-IT | Mentor Management)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.mentor_applications (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  cv_url       TEXT,
  expertise    TEXT[],
  statement    TEXT,
  status       TEXT        NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.mentor_applications ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- SECTION 4: MENTORSHIP REQUESTS
-- (Member 1 – sneha-dhaya-IT | Request Management)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.requests (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  title           TEXT        NOT NULL,
  description     TEXT,
  domain          TEXT,
  deadline        TIMESTAMPTZ,
  type            TEXT,
  status          TEXT        NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
  assigned_mentor UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_by      UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS requests_updated_at ON public.requests;
CREATE TRIGGER requests_updated_at
  BEFORE UPDATE ON public.requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ============================================================
-- SECTION 5: RATINGS
-- (Member 1 – sneha-dhaya-IT | Rating System)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ratings (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id  UUID        REFERENCES public.requests(id) ON DELETE CASCADE,
  mentor_id   UUID        REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id  UUID        REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating      INT         CHECK (rating BETWEEN 1 AND 5),
  review      TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- SECTION 6: NOTIFICATIONS
-- (Your module – AK29-Shay | Notification System)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type        TEXT        NOT NULL,
  payload     JSONB       DEFAULT '{}',
  read        BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_read_idx ON public.notifications(read);


-- ============================================================
-- SECTION 7: OTP (Email Verification)
-- (Member 1 – sneha-dhaya-IT | Auth)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.otps (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  otp         TEXT        NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  attempts    INT         NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.otps ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- SECTION 8: POSTS
-- (AK29-Shay | Idea & Guidance Module)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.posts (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_mode       post_mode   NOT NULL DEFAULT 'post',
  post_type       post_type   NOT NULL DEFAULT 'idea',
  title           TEXT        NOT NULL,
  description     TEXT,
  tech_stack      TEXT[],
  dynamic_content JSONB       NOT NULL DEFAULT '{}',
  view_count      INTEGER     NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS posts_updated_at ON public.posts;
CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS posts_user_id_idx         ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS posts_created_at_idx      ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS posts_dynamic_content_idx ON public.posts USING GIN(dynamic_content);
CREATE INDEX IF NOT EXISTS posts_tech_stack_idx      ON public.posts USING GIN(tech_stack);


-- ============================================================
-- SECTION 9: COMMENTS (Recursive)
-- (AK29-Shay | Idea & Guidance Module — Threaded Discussions)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.comments (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id           UUID        NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id           UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_comment_id UUID        REFERENCES public.comments(id) ON DELETE CASCADE,
  content           TEXT        NOT NULL,
  is_accepted       BOOLEAN     NOT NULL DEFAULT FALSE,
  upvotes           INTEGER     NOT NULL DEFAULT 0 CHECK (upvotes >= 0),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS comments_updated_at ON public.comments;
CREATE TRIGGER comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS comments_post_id_idx    ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS comments_parent_id_idx  ON public.comments(parent_comment_id);


-- ============================================================
-- SECTION 10: ROW LEVEL SECURITY POLICIES
-- ============================================================

-- PROFILES (public read, own-update)
DROP POLICY IF EXISTS "Profiles viewable by authenticated"  ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile"            ON public.profiles;
CREATE POLICY "Profiles viewable by authenticated"  ON public.profiles FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Users update own profile"            ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users insert own profile"            ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- MENTOR APPLICATIONS
DROP POLICY IF EXISTS "Users view own mentor application"   ON public.mentor_applications;
DROP POLICY IF EXISTS "Users create mentor application"     ON public.mentor_applications;
CREATE POLICY "Users view own mentor application"   ON public.mentor_applications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users create mentor application"     ON public.mentor_applications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- REQUESTS (students create, parties view own)
DROP POLICY IF EXISTS "Students create requests"    ON public.requests;
DROP POLICY IF EXISTS "Parties view own requests"   ON public.requests;
CREATE POLICY "Students create requests"    ON public.requests FOR INSERT  TO authenticated WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Parties view own requests"   ON public.requests FOR SELECT  TO authenticated USING (auth.uid() = student_id OR auth.uid() = assigned_mentor);
CREATE POLICY "Parties update own requests" ON public.requests FOR UPDATE  TO authenticated USING (auth.uid() = student_id OR auth.uid() = assigned_mentor);

-- NOTIFICATIONS (user sees only their own)
DROP POLICY IF EXISTS "Users view own notifications"    ON public.notifications;
DROP POLICY IF EXISTS "Users update own notifications"  ON public.notifications;
CREATE POLICY "Users view own notifications"    ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications"  ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "System insert notifications"     ON public.notifications FOR INSERT TO authenticated WITH CHECK (TRUE);

-- RATINGS
DROP POLICY IF EXISTS "Students create ratings"   ON public.ratings;
DROP POLICY IF EXISTS "Ratings publicly readable" ON public.ratings;
CREATE POLICY "Students create ratings"   ON public.ratings FOR INSERT TO authenticated WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Ratings publicly readable" ON public.ratings FOR SELECT TO authenticated USING (TRUE);

-- POSTS (full CRUD for owner, read for all authenticated)
DROP POLICY IF EXISTS "All authenticated read posts"      ON public.posts;
DROP POLICY IF EXISTS "Authenticated create posts"        ON public.posts;
DROP POLICY IF EXISTS "Post owners update own posts"      ON public.posts;
DROP POLICY IF EXISTS "Post owners delete own posts"      ON public.posts;
CREATE POLICY "All authenticated read posts"    ON public.posts FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Authenticated create posts"      ON public.posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Post owners update own posts"    ON public.posts FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Post owners delete own posts"    ON public.posts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- COMMENTS
DROP POLICY IF EXISTS "All authenticated read comments"   ON public.comments;
DROP POLICY IF EXISTS "Authenticated insert comments"     ON public.comments;
DROP POLICY IF EXISTS "Post owner accepts comment"        ON public.comments;
DROP POLICY IF EXISTS "Comment author deletes own"        ON public.comments;
CREATE POLICY "All authenticated read comments" ON public.comments FOR SELECT  TO authenticated USING (TRUE);
CREATE POLICY "Authenticated insert comments"   ON public.comments FOR INSERT  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Post owner accepts comment"      ON public.comments FOR UPDATE  TO authenticated USING (EXISTS (SELECT 1 FROM public.posts WHERE posts.id = comments.post_id AND posts.user_id = auth.uid()));
CREATE POLICY "Comment author deletes own"      ON public.comments FOR DELETE  TO authenticated USING (auth.uid() = user_id);


-- ============================================================
-- SECTION 11: RPC FUNCTION — Recursive Thread Fetcher
-- (AK29-Shay | Optimized comment tree via recursive CTE)
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
  SELECT c.id, c.post_id, c.user_id, c.parent_comment_id,
         c.content, c.is_accepted, c.upvotes, c.created_at,
         0 AS depth, ARRAY[c.id] AS path
  FROM public.comments c
  WHERE c.post_id = p_post_id AND c.parent_comment_id IS NULL
  UNION ALL
  SELECT c.id, c.post_id, c.user_id, c.parent_comment_id,
         c.content, c.is_accepted, c.upvotes, c.created_at,
         ct.depth + 1, ct.path || c.id
  FROM public.comments c
  INNER JOIN comment_tree ct ON c.parent_comment_id = ct.id
  WHERE c.post_id = p_post_id
)
SELECT
  ct.id, ct.post_id, ct.user_id, ct.parent_comment_id,
  ct.content, ct.is_accepted, ct.upvotes, ct.created_at,
  COALESCE(p.full_name, 'Anonymous') AS author_name,
  p.avatar_url                        AS author_avatar,
  COALESCE(p.role, 'Student')         AS author_role,
  ct.depth, ct.path
FROM comment_tree ct
LEFT JOIN public.profiles p ON p.id = ct.user_id
ORDER BY ct.path;
$$ LANGUAGE sql STABLE SECURITY DEFINER;


-- ============================================================
-- SECTION 11A: MENTOR BLOGS
-- (Mentor dashboard blog persistence)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.mentor_blogs (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  author_email TEXT        NOT NULL,
  title        TEXT        NOT NULL,
  content      TEXT        NOT NULL,
  image_url    TEXT,
  video_url    TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.mentor_blogs ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS mentor_blogs_updated_at ON public.mentor_blogs;
CREATE TRIGGER mentor_blogs_updated_at
  BEFORE UPDATE ON public.mentor_blogs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS mentor_blogs_author_email_idx ON public.mentor_blogs(author_email);
CREATE INDEX IF NOT EXISTS mentor_blogs_created_at_idx   ON public.mentor_blogs(created_at DESC);

DROP POLICY IF EXISTS "Users read own mentor blogs"   ON public.mentor_blogs;
DROP POLICY IF EXISTS "Users create own mentor blogs" ON public.mentor_blogs;
DROP POLICY IF EXISTS "Users update own mentor blogs" ON public.mentor_blogs;
DROP POLICY IF EXISTS "Users delete own mentor blogs" ON public.mentor_blogs;

CREATE POLICY "Users read own mentor blogs"
  ON public.mentor_blogs FOR SELECT TO authenticated
  USING ((auth.jwt() ->> 'email') = author_email);

CREATE POLICY "Users create own mentor blogs"
  ON public.mentor_blogs FOR INSERT TO authenticated
  WITH CHECK ((auth.jwt() ->> 'email') = author_email);

CREATE POLICY "Users update own mentor blogs"
  ON public.mentor_blogs FOR UPDATE TO authenticated
  USING ((auth.jwt() ->> 'email') = author_email);

CREATE POLICY "Users delete own mentor blogs"
  ON public.mentor_blogs FOR DELETE TO authenticated
  USING ((auth.jwt() ->> 'email') = author_email);


-- ============================================================
-- SECTION 12: ANALYTICS VIEW
-- (Member 4 – abinayan03 | Aggregated platform metrics)
-- ============================================================
CREATE OR REPLACE VIEW public.platform_analytics AS
SELECT
  (SELECT COUNT(*) FROM public.posts)                               AS total_posts,
  (SELECT COUNT(*) FROM public.posts WHERE created_at > NOW() - INTERVAL '7 days') AS posts_this_week,
  (SELECT COUNT(*) FROM public.comments)                            AS total_comments,
  (SELECT COUNT(*) FROM public.comments WHERE created_at > NOW() - INTERVAL '1 day') AS comments_today,
  (SELECT COUNT(*) FROM public.profiles)                            AS total_users,
  (SELECT COUNT(*) FROM public.profiles WHERE role = 'Mentor')      AS total_mentors,
  (SELECT COALESCE(SUM(view_count), 0) FROM public.posts)           AS total_views,
  (SELECT COALESCE(SUM(upvotes), 0) FROM public.comments)           AS total_upvotes;


-- ============================================================
-- Done! All tables, RLS policies, triggers, and RPCs created.
-- ============================================================
