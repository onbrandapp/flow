-- Create a table for public profiles
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text,

  constraint username_length check (char_length(username) >= 3)
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Create a table for needs
create table needs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references profiles(id) on delete cascade not null,
  content text not null,
  status text default 'open' check (status in ('open', 'in_progress', 'fulfilled', 'cancelled')),
  tags text[],
  urgency text default 'normal' check (urgency in ('low', 'normal', 'high', 'critical')),
  is_anonymous boolean default false
);

-- Set up RLS for needs
alter table needs enable row level security;

create policy "Needs are viewable by everyone."
  on needs for select
  using ( true );

create policy "Users can insert their own needs."
  on needs for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own needs."
  on needs for update
  using ( auth.uid() = user_id );

-- Set up Realtime
alter publication supabase_realtime add table needs;
