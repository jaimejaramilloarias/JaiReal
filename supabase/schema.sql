-- Supabase schema for JaiReal-PRO cloud sync

-- Users table (uses built-in auth.users but mirror for profiles)
create table if not exists public.users (
  id uuid primary key default auth.uid(),
  email text
);

-- Charts owned by users
create table if not exists public.charts (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null references public.users(id) on delete cascade,
  title text not null,
  data jsonb not null,
  tags text[] default array[]::text[],
  updated_at timestamptz not null default now()
);
create index if not exists charts_owner_idx on public.charts(owner);
create index if not exists charts_title_idx on public.charts(title);

-- Revisions for history
create table if not exists public.revisions (
  id uuid primary key default gen_random_uuid(),
  chart_id uuid not null references public.charts(id) on delete cascade,
  created_at timestamptz not null default now(),
  data jsonb not null
);
create index if not exists revisions_chart_idx on public.revisions(chart_id);

-- Shares with basic roles
create type public.share_role as enum ('editor','commenter','reader');
create table if not exists public.shares (
  id uuid primary key default gen_random_uuid(),
  chart_id uuid not null references public.charts(id) on delete cascade,
  email text not null,
  role share_role not null,
  created_at timestamptz not null default now()
);
create index if not exists shares_chart_idx on public.shares(chart_id);

-- Collections of charts
create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null references public.users(id) on delete cascade,
  name text not null
);
create index if not exists collections_owner_idx on public.collections(owner);

create table if not exists public.collection_items (
  collection_id uuid references public.collections(id) on delete cascade,
  chart_id uuid references public.charts(id) on delete cascade,
  primary key (collection_id, chart_id)
);
create index if not exists collection_items_chart_idx on public.collection_items(chart_id);

-- Separate tags table for search
create table if not exists public.tags (
  chart_id uuid not null references public.charts(id) on delete cascade,
  tag text not null,
  primary key (chart_id, tag)
);
create index if not exists tags_tag_idx on public.tags(tag);

-- Enable row level security
alter table public.charts enable row level security;
alter table public.revisions enable row level security;
alter table public.shares enable row level security;
alter table public.collections enable row level security;
alter table public.collection_items enable row level security;
alter table public.tags enable row level security;

-- Policies: owners can manage their data, shared emails can read as per role
create policy "Charts are editable by owner" on public.charts
  for all using (auth.uid() = owner);
create policy "Revisions follow chart access" on public.revisions
  for all using (auth.uid() = (select owner from public.charts where id = chart_id));
create policy "Shares editable by owner" on public.shares
  for all using (auth.uid() = (select owner from public.charts where id = chart_id));
create policy "Collections editable by owner" on public.collections
  for all using (auth.uid() = owner);
create policy "Collection items editable by owner" on public.collection_items
  for all using (auth.uid() = (select owner from public.collections where id = collection_id));
create policy "Tags editable by owner" on public.tags
  for all using (auth.uid() = (select owner from public.charts where id = chart_id));
