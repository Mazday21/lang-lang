-- ==============================================================================
-- Supabase Schema & Row Level Security (RLS)
-- Personal Language AI Trainer Telegram Mini App
-- ==============================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. USERS TABLE
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  telegram_id bigint not null unique,
  first_name text,
  username text,
  plan text not null default 'free',                 -- 'free' | 'pro'
  native_language text default null,                 -- 'ru' | 'uz'
  target_language text default null,                 -- 'en' | 'uz' | 'ru'
  ai_requests_today integer not null default 0,      -- Daily usage counter
  last_request_date text not null default to_char(now(), 'YYYY-MM-DD'), -- Reset date
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Idempotent column additions for existing installations
alter table public.users add column if not exists plan text not null default 'free';
alter table public.users add column if not exists native_language text default null;
alter table public.users add column if not exists target_language text default null;
alter table public.users add column if not exists ai_requests_today integer not null default 0;
alter table public.users add column if not exists ai_requests_total integer not null default 0;  -- lifetime AI checks used (free trial = 5)
alter table public.users add column if not exists last_request_date text not null default to_char(now(), 'YYYY-MM-DD');

-- Index for instant Telegram ID lookup
create index if not exists idx_users_telegram_id on public.users(telegram_id);

-- Proficiency level (0..10) determined by the placement mini-test
alter table public.users add column if not exists proficiency_level integer not null default 0;
alter table public.users add column if not exists base_level integer not null default 0;
alter table public.users add column if not exists placement_tested boolean not null default false;

-- 3. DECKS TABLE
create table if not exists public.decks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  description text,
  native_language text default 'ru',
  target_language text default 'uz',
  language_pair text default 'ru-uz',
  level integer not null default 1,                  -- difficulty level (1 = Новичок, 2 = Базовый, 3 = Средний, ...)
  source text not null default 'user',               -- 'seed' | 'ai' | 'user' — content origin
  content_hash text,                                 -- idempotency key for auto-generated content
  is_dynamic boolean not null default true,          -- AI dynamic context generation enabled
  is_starter boolean not null default false,         -- system starter deck shared with all users
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.decks add column if not exists is_dynamic boolean not null default true;
alter table public.decks add column if not exists native_language text default 'ru';
alter table public.decks add column if not exists target_language text default 'uz';
alter table public.decks add column if not exists language_pair text default 'ru-uz';
alter table public.decks add column if not exists level integer not null default 1;
alter table public.decks add column if not exists is_starter boolean not null default false;
alter table public.decks add column if not exists source text not null default 'user';
alter table public.decks add column if not exists content_hash text;

create index if not exists idx_decks_user_id on public.decks(user_id);
create unique index if not exists idx_decks_content_hash on public.decks(content_hash) where content_hash is not null;
create index if not exists idx_decks_pair_level on public.decks(language_pair, level);

-- 4. CARDS TABLE (SM-2 Interval Repetition)
create table if not exists public.cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  deck_id uuid references public.decks(id) on delete cascade,
  front text not null,
  back text not null,
  rule_description text,
  interval integer not null default 0,          -- interval in days
  repetitions integer not null default 0,       -- consecutive correct reviews
  ease_factor double precision not null default 2.50, -- SM-2 ease factor (clamped >= 1.30)
  next_review_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_cards_user_id on public.cards(user_id);
create index if not exists idx_cards_next_review on public.cards(user_id, next_review_at);

-- 4b. REVIEW LOG (analytics for the AI refill pipeline)
create table if not exists public.review_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  card_id uuid references public.cards(id) on delete cascade,
  deck_id uuid references public.decks(id) on delete cascade,
  grade integer not null,                            -- SM-2 grade (1..4)
  reviewed_at timestamptz not null default now()
);

alter table public.review_log add column if not exists grade integer not null default 0;

create index if not exists idx_review_log_user on public.review_log(user_id, reviewed_at);
create index if not exists idx_review_log_card on public.review_log(card_id);

-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- Strict isolation: No user can access or mutate data belonging to other users.

alter table public.users enable row level security;
alter table public.decks enable row level security;
alter table public.cards enable row level security;

-- USERS POLICIES
drop policy if exists "Users can view their own profile" on public.users;
create policy "Users can view their own profile"
  on public.users for select
  using (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.users;
create policy "Users can update their own profile"
  on public.users for update
  using (auth.uid() = id);

-- DECKS POLICIES
drop policy if exists "Users can select own decks" on public.decks;
create policy "Users can select own decks"
  on public.decks for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own decks" on public.decks;
create policy "Users can insert own decks"
  on public.decks for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own decks" on public.decks;
create policy "Users can update own decks"
  on public.decks for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete own decks" on public.decks;
create policy "Users can delete own decks"
  on public.decks for delete
  using (auth.uid() = user_id);

-- CARDS POLICIES
drop policy if exists "Users can select own cards" on public.cards;
create policy "Users can select own cards"
  on public.cards for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own cards" on public.cards;
create policy "Users can insert own cards"
  on public.cards for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own cards" on public.cards;
create policy "Users can update own cards"
  on public.cards for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete own cards" on public.cards;
create policy "Users can delete own cards"
  on public.cards for delete
  using (auth.uid() = user_id);
