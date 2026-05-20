-- ================================================================
-- Aristotle AI — Supabase Database Setup
-- Paste this entire file into: Supabase Dashboard → SQL Editor → Run
-- ================================================================

-- 1. Daily study logs (one row per user per day)
create table if not exists tracking_daylogs (
  id         uuid    default gen_random_uuid() primary key,
  user_id    uuid    references auth.users on delete cascade not null,
  date       text    not null,          -- YYYY-MM-DD
  minutes    integer default 0,
  questions  integer default 0,
  topics     text[]  default '{}',
  unique(user_id, date)
);

-- 2. Practice quiz results (one row per quiz attempt)
create table if not exists tracking_practice (
  id         uuid        default gen_random_uuid() primary key,
  user_id    uuid        references auth.users on delete cascade not null,
  subject    text        not null,
  score      integer     not null,      -- 0-100
  total      integer     not null,
  correct    integer     not null,
  created_at timestamptz default now()
);

-- 3. Wrong answers / mistake memory
create table if not exists tracking_mistakes (
  id             uuid        default gen_random_uuid() primary key,
  user_id        uuid        references auth.users on delete cascade not null,
  topic          text        not null,
  question       text        not null,
  user_answer    text        not null,
  correct_answer text        not null,
  created_at     timestamptz default now()
);

-- ── Row Level Security (users can only see/write their own data) ──
alter table tracking_daylogs  enable row level security;
alter table tracking_practice enable row level security;
alter table tracking_mistakes enable row level security;

create policy "Users own daylogs"   on tracking_daylogs  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users own practice"  on tracking_practice for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users own mistakes"  on tracking_mistakes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── Indexes for fast queries ──
create index if not exists idx_daylogs_user_date   on tracking_daylogs  (user_id, date desc);
create index if not exists idx_practice_user       on tracking_practice (user_id, created_at desc);
create index if not exists idx_mistakes_user       on tracking_mistakes (user_id, created_at desc);

-- ================================================================
-- After running this SQL, also:
-- 1. Go to Authentication → Settings → disable email confirmation (for demo)
-- 2. Create the demo account: Authentication → Users → "Add user"
--    Email: demo@aristotle.ai  Password: demo-aristotle-2024
-- ================================================================
