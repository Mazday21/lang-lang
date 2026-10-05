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
  ai_requests_today integer not null default 0,      -- Daily usage counter
  last_request_date text not null default to_char(now(), 'YYYY-MM-DD'), -- Reset date
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Idempotent column additions for existing installations
alter table public.users add column if not exists plan text not null default 'free';
alter table public.users add column if not exists ai_requests_today integer not null default 0;
alter table public.users add column if not exists last_request_date text not null default to_char(now(), 'YYYY-MM-DD');

-- Index for instant Telegram ID lookup
create index if not exists idx_users_telegram_id on public.users(telegram_id);

-- 3. DECKS TABLE
create table if not exists public.decks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  description text,
  is_dynamic boolean not null default true,          -- AI dynamic context generation enabled
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.decks add column if not exists is_dynamic boolean not null default true;

create index if not exists idx_decks_user_id on public.decks(user_id);

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
