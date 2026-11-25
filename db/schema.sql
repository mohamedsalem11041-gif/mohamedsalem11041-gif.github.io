-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Roles & Enums
create type status_state as enum ('draft', 'published');

-- 2. Utility Functions (Triggers)
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- 3. Tables

-- Users (Admin Audit)
-- Note: Ideally this links to auth.users, but keeping standalone as per PRD for metadata.
create table users (
  id uuid primary key default gen_random_uuid(), -- Or references auth.users(id)
  email text unique not null,
  role text not null check (role = 'admin'),
  created_at timestamptz default now()
);

-- Projects
create table projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  summary text,
  description_md text,
  demo_url text,
  code_url text,
  tags text[] default '{}',
  images jsonb default '[]', -- [{url, alt}]
  status status_state not null default 'draft',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  published_at timestamptz
);

-- Graphics
create table graphics (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  client text,
  description text,
  tags text[] default '{}',
  preview_url text,
  asset_urls jsonb default '[]', -- list of urls
  status status_state not null default 'draft',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Reels
create table reels (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  description text,
  tags text[] default '{}',
  video_url text not null,
  poster_url text,
  duration int,
  status status_state not null default 'draft',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Blog Posts
create table blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  summary text,
  content_md text,
  cover_url text,
  tags text[] default '{}',
  status status_state not null default 'draft',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  published_at timestamptz,
  og_image_url text
);

-- Hobbies
create table hobbies (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  description text,
  media_urls jsonb default '[]', -- list of urls
  tags text[] default '{}',
  status status_state not null default 'draft',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Certs
create table certs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  issuer text,
  issue_date date,
  expires_at date,
  badge_url text,
  verify_url text,
  tags text[] default '{}',
  status status_state not null default 'published',
  sort_order integer,
  created_at timestamptz default now()
);

-- Badges
create table badges (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  image_url text,
  verify_url text,
  status status_state not null default 'published',
  sort_order integer,
  created_at timestamptz default now()
);

-- Contact Submissions
create table contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  source_page text,
  created_at timestamptz default now()
);

-- Settings (Singleton)
create table settings (
  id boolean primary key default true, -- Enforce single row
  availability_status text,
  hero_copy text,
  socials jsonb default '{}', -- {email, github, linkedin}
  cv_url text,
  seo_defaults jsonb default '{}',
  constraint settings_singleton check (id = true)
);

-- 4. Indexes (Efficiency Improvements)

-- GIN Indexes for fast Tag filtering
create index projects_tags_idx on projects using gin (tags);
create index graphics_tags_idx on graphics using gin (tags);
create index reels_tags_idx on reels using gin (tags);
create index blog_posts_tags_idx on blog_posts using gin (tags);
create index hobbies_tags_idx on hobbies using gin (tags);
create index certs_tags_idx on certs using gin (tags);

-- B-Tree Indexes for sorting by Published/Created Date
create index projects_published_at_idx on projects (published_at desc nulls last);
create index blog_posts_published_at_idx on blog_posts (published_at desc nulls last);
create index graphics_updated_at_idx on graphics (updated_at desc);
create index reels_updated_at_idx on reels (updated_at desc);

-- 5. Triggers for updated_at
create trigger on_projects_updated before update on projects
  for each row execute procedure handle_updated_at();

create trigger on_graphics_updated before update on graphics
  for each row execute procedure handle_updated_at();

create trigger on_reels_updated before update on reels
  for each row execute procedure handle_updated_at();

create trigger on_blog_posts_updated before update on blog_posts
  for each row execute procedure handle_updated_at();

create trigger on_hobbies_updated before update on hobbies
  for each row execute procedure handle_updated_at();

-- 6. Row Level Security (RLS)

-- Enable RLS on all tables
alter table users enable row level security;
alter table projects enable row level security;
alter table graphics enable row level security;
alter table reels enable row level security;
alter table blog_posts enable row level security;
alter table hobbies enable row level security;
alter table certs enable row level security;
alter table badges enable row level security;
alter table contact_submissions enable row level security;
alter table settings enable row level security;

-- Policies

-- Public Read Policies (Published Content)
create policy "Public read published projects" on projects for select using (status = 'published');
create policy "Public read published graphics" on graphics for select using (status = 'published');
create policy "Public read published reels" on reels for select using (status = 'published');
create policy "Public read published blog_posts" on blog_posts for select using (status = 'published');
create policy "Public read published hobbies" on hobbies for select using (status = 'published');
create policy "Public read published certs" on certs for select using (status = 'published');
create policy "Public read published badges" on badges for select using (status = 'published');
create policy "Public read settings" on settings for select using (true); -- Settings are generally public

-- Admin Full Access Policies
-- Defined as: User is authenticated AND exists in the 'users' table with role 'admin' matching their auth.uid()
-- Note: This requires the 'users' table id to match auth.uid().

create policy "Admin all users" on users for all using (
  auth.role() = 'authenticated' and auth.uid() = id and role = 'admin'
);
-- Allow admin to read their own user record to verify role (bootstrapping recursion prevention)
create policy "Admin read own user" on users for select using (
  auth.role() = 'authenticated' and auth.uid() = id
);

-- Generic Admin Policy Macro Logic (Applied per table)
-- We check if the current user is an admin by querying the users table.

create policy "Admin all projects" on projects for all using (
  auth.role() = 'authenticated' and exists (select 1 from users u where u.id = auth.uid() and u.role = 'admin')
);

create policy "Admin all graphics" on graphics for all using (
  auth.role() = 'authenticated' and exists (select 1 from users u where u.id = auth.uid() and u.role = 'admin')
);

create policy "Admin all reels" on reels for all using (
  auth.role() = 'authenticated' and exists (select 1 from users u where u.id = auth.uid() and u.role = 'admin')
);

create policy "Admin all blog_posts" on blog_posts for all using (
  auth.role() = 'authenticated' and exists (select 1 from users u where u.id = auth.uid() and u.role = 'admin')
);

create policy "Admin all hobbies" on hobbies for all using (
  auth.role() = 'authenticated' and exists (select 1 from users u where u.id = auth.uid() and u.role = 'admin')
);

create policy "Admin all certs" on certs for all using (
  auth.role() = 'authenticated' and exists (select 1 from users u where u.id = auth.uid() and u.role = 'admin')
);

create policy "Admin all badges" on badges for all using (
  auth.role() = 'authenticated' and exists (select 1 from users u where u.id = auth.uid() and u.role = 'admin')
);

create policy "Admin all settings" on settings for all using (
  auth.role() = 'authenticated' and exists (select 1 from users u where u.id = auth.uid() and u.role = 'admin')
);

create policy "Admin all submissions" on contact_submissions for all using (
  auth.role() = 'authenticated' and exists (select 1 from users u where u.id = auth.uid() and u.role = 'admin')
);
-- Public can INSERT contact submissions
create policy "Public insert contact_submissions" on contact_submissions for insert with check (true);
