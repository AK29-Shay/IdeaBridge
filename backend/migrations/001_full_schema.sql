-- =============================================================
-- IdeaBridge – Full Schema Migration
-- Run this in your Supabase SQL editor (or as a migration)
-- =============================================================

-- ─── EXTENSIONS ───────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================
-- TABLE: profiles
-- One row per auth.users entry. Stores both student & mentor data.
-- =============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role          text NOT NULL DEFAULT 'student' CHECK (role IN ('student','mentor')),

  -- shared fields
  full_name     text NOT NULL DEFAULT '',
  bio           text,
  skills        text[]         DEFAULT '{}',
  linkedin      text,
  github        text,
  profile_image text,           -- URL (Supabase Storage or external)

  -- student-only fields
  study_year    text,
  faculty       text,
  specialization text,

  -- mentor-only fields
  academic_year          text,
  availability           text   CHECK (availability IS NULL OR availability IN ('Full-time','Part-time','Evenings')),
  availability_status    text   CHECK (availability_status IS NULL OR availability_status IN ('Available Now','Available in 1-2 days','Busy','On Leave')),
  years_experience       int    CHECK (years_experience IS NULL OR years_experience >= 0),
  portfolio_links        text[] DEFAULT '{}',
  availability_calendar_note text,

  -- reputation / rating cache (updated after each rating insert)
  reputation      numeric(3,2) NOT NULL DEFAULT 0.00,
  rating_count    int          NOT NULL DEFAULT 0,

  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Keep updated_at fresh automatically
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- =============================================================
-- TABLE: help_requests
-- Students create requests; mentors accept/manage them.
-- =============================================================
CREATE TABLE IF NOT EXISTS help_requests (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      uuid NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  mentor_id       uuid REFERENCES profiles(user_id) ON DELETE SET NULL,

  title           text NOT NULL,
  request_type    text NOT NULL CHECK (request_type IN ('full_project','specific_idea')),
  description     text NOT NULL,
  domain          text NOT NULL,
  deadline        timestamptz,

  status          text NOT NULL DEFAULT 'open'
                  CHECK (status IN ('open','accepted','in_progress','completed','rejected','closed')),

  updated_by      uuid REFERENCES profiles(user_id) ON DELETE SET NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER set_help_requests_updated_at
  BEFORE UPDATE ON help_requests
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- =============================================================
-- TABLE: ratings
-- Students rate mentors once per completed request.
-- =============================================================
CREATE TABLE IF NOT EXISTS ratings (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id  uuid NOT NULL REFERENCES help_requests(id) ON DELETE CASCADE,
  mentor_id   uuid NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  student_id  uuid NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,

  rating      int  NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review      text,

  created_at  timestamptz NOT NULL DEFAULT now(),

  -- one rating per request
  UNIQUE (request_id, student_id)
);

-- After a new rating, refresh mentor reputation on profiles
CREATE OR REPLACE FUNCTION refresh_mentor_reputation()
RETURNS TRIGGER AS $$
DECLARE
  avg_rating numeric(3,2);
  cnt        int;
BEGIN
  SELECT AVG(rating)::numeric(3,2), COUNT(*)
  INTO avg_rating, cnt
  FROM ratings
  WHERE mentor_id = NEW.mentor_id;

  UPDATE profiles
  SET reputation  = COALESCE(avg_rating, 0),
      rating_count = cnt
  WHERE user_id = NEW.mentor_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_rating_insert
  AFTER INSERT ON ratings
  FOR EACH ROW EXECUTE FUNCTION refresh_mentor_reputation();

-- =============================================================
-- TABLE: blogs
-- Authored by mentors only.
-- =============================================================
CREATE TABLE IF NOT EXISTS blogs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id   uuid NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,

  title       text NOT NULL,
  content     text NOT NULL,
  tags        text[] DEFAULT '{}',
  published   boolean NOT NULL DEFAULT true,

  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER set_blogs_updated_at
  BEFORE UPDATE ON blogs
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- =============================================================
-- TABLE: notifications
-- Simple event notifications per user.
-- =============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  type        text NOT NULL,             -- e.g. 'request_accepted', 'new_rating'
  title       text,
  message     text,
  payload     jsonb,                     -- flexible extra data
  read        boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- =============================================================
-- TABLE: otp_verification
-- Email OTP-based 2FA.
-- =============================================================
CREATE TABLE IF NOT EXISTS otp_verification (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  otp         text NOT NULL,
  expires_at  timestamptz NOT NULL,
  attempts    int NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- =============================================================
-- ROW LEVEL SECURITY (RLS)
-- Enable RLS on all tables. Policies grant:
--   - users read/write their own data
--   - service role bypasses all policies (used by our API server)
-- =============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_verification ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all mentor profiles (for search), manage own
CREATE POLICY "profiles_select_all" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "profiles_delete_own" ON profiles FOR DELETE USING (auth.uid() = user_id);

-- Help requests: students see own, mentors see all relevant
CREATE POLICY "requests_select" ON help_requests FOR SELECT USING (
  auth.uid() = student_id OR auth.uid() = mentor_id OR
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'mentor')
);
CREATE POLICY "requests_insert_student" ON help_requests FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "requests_update_mentor"  ON help_requests FOR UPDATE USING (auth.uid() = mentor_id OR auth.uid() = student_id);

-- Ratings: student submits one rating per request
CREATE POLICY "ratings_select_all" ON ratings FOR SELECT USING (true);
CREATE POLICY "ratings_insert_student" ON ratings FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Blogs: anyone can read published blogs; authors manage their own
CREATE POLICY "blogs_select_published" ON blogs FOR SELECT USING (published = true OR auth.uid() = author_id);
CREATE POLICY "blogs_insert_mentor"    ON blogs FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "blogs_update_own"       ON blogs FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "blogs_delete_own"       ON blogs FOR DELETE USING (auth.uid() = author_id);

-- Notifications: users see only their own
CREATE POLICY "notifications_select_own" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifications_update_own" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- OTP: own only
CREATE POLICY "otp_select_own" ON otp_verification FOR SELECT USING (auth.uid() = user_id);

-- =============================================================
-- USEFUL VIEW: mentor_search
-- Pre-joins profile + rating stats for the mentor search endpoint.
-- =============================================================
CREATE OR REPLACE VIEW mentor_profiles AS
SELECT
  p.user_id,
  p.full_name,
  p.bio,
  p.skills,
  p.linkedin,
  p.github,
  p.profile_image,
  p.academic_year,
  p.faculty,
  p.availability,
  p.availability_status,
  p.years_experience,
  p.portfolio_links,
  p.availability_calendar_note,
  p.reputation,
  p.rating_count,
  p.created_at
FROM profiles p
WHERE p.role = 'mentor';
