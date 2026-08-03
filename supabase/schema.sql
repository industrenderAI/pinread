-- PinRead 云端数据库结构
-- 使用方法：打开 Supabase 项目 -> SQL Editor -> New query -> 粘贴整份文件 -> Run


-- =====================================================
-- 1. profiles 表：登录用户公开资料
-- =====================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  avatar text,
  created_at timestamptz not null default now()
);


alter table public.profiles enable row level security;


create policy "profiles_select_own"
on public.profiles
for select
using (auth.uid() = id);


create policy "profiles_update_own"
on public.profiles
for update
using (auth.uid() = id);



-- 新用户注册时自动创建 profile

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    name,
    avatar
  )
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


drop trigger if exists on_auth_user_created
on auth.users;


create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();



-- =====================================================
-- 2. categories 表：用户自定义分类
-- =====================================================

create table if not exists public.categories (

  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  name text not null,

  created_at timestamptz not null default now(),

  unique(user_id, name)

);



alter table public.categories enable row level security;



create policy "categories_all_own"
on public.categories
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);




-- =====================================================
-- 3. items 表：用户笔记
-- =====================================================

-- 一条 item 对应用户的一条学习笔记
-- category 用于用户自定义分类
-- annotations 保存划线/批注数据


create table if not exists public.items (

  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references auth.users(id)
    on delete cascade,


  content text not null,


  source text not null default '',


  category text not null default '',


  annotations jsonb not null default '[]'::jsonb,


  created_at bigint not null,


  updated_at bigint not null

);



create index if not exists items_user_id_idx
on public.items(user_id);



alter table public.items enable row level security;



create policy "items_all_own"
on public.items
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);