-- Initial schema for IdeaBridge

-- Profiles table (separate from auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null,
  full_name text,
  bio text,
  skills text[],
  availability text,
  role text default 'student',
  reputation numeric default 0,
  inserted_at timestamptz default now(),
  updated_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS mentor_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(user_id) on delete cascade,
  cv_url text,
  expertise text[],
  statement text,
  status text default 'pending',
  created_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS requests (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references profiles(user_id) on delete set null,
  title text,
  description text,
  domain text,
  deadline timestamptz,
  type text,
  status text default 'open',
  assigned_mentor uuid,
  updated_by uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS ratings (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references requests(id) on delete cascade,
  mentor_id uuid references profiles(user_id) on delete cascade,
  student_id uuid references profiles(user_id) on delete cascade,
  rating int,
  review text,
  created_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  type text,
  payload jsonb,
  read boolean default false,
  created_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS otps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique,
  otp text,
  expires_at timestamptz,
  attempts int default 0,
  created_at timestamptz default now()
);
