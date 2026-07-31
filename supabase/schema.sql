-- PinRead 云端数据库结构
-- 使用方法：打开 Supabase 项目 -> 左侧 SQL Editor -> New query -> 粘贴整份文件 -> Run

-- ========== 1. profiles 表：登录用户的公开资料 ==========
-- auth.users 是 Supabase 内置的账号表（邮箱/密码/OAuth 都存在这里），
-- 我们不直接改它，而是建一张 profiles 表，1:1 关联，存放昵称、头像等。
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  avatar text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- 新用户注册（无论邮箱密码 / 验证码 / Google）时，自动创建一条 profile。
-- 名字优先取注册时传的 name，其次取邮箱 @ 前面的部分，再其次是 Google 头像/昵称。
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, avatar)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'name',
      new.raw_user_meta_data->>'full_name',
      split_part(new.email, '@', 1)
    ),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ========== 2. languages 表：用户自定义的语言分类 ==========
create table if not exists public.languages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

alter table public.languages enable row level security;

create policy "languages_all_own" on public.languages
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);


-- ========== 3. items 表：笔记 ==========
-- annotations（划线批注）直接存成 jsonb 数组，结构和前端 Annotation[] 一致，
-- 不用单独开一张表，减少一次 join。
create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  source text not null default '',
  language text not null default '',
  annotations jsonb not null default '[]'::jsonb,
  created_at bigint not null,
  updated_at bigint not null
);

create index if not exists items_user_id_idx on public.items (user_id);

alter table public.items enable row level security;

create policy "items_all_own" on public.items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
