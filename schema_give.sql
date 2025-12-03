-- Create a table for gives (items)
create table gives (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references profiles(id) on delete cascade not null,
  title text,
  description text,
  image_url text not null,
  status text default 'available' check (status in ('available', 'promised', 'given', 'archived')),
  tags text[]
);

-- Set up RLS for gives
alter table gives enable row level security;

create policy "Gives are viewable by everyone."
  on gives for select
  using ( true );

create policy "Users can insert their own gives."
  on gives for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own gives."
  on gives for update
  using ( auth.uid() = user_id );

-- Set up Realtime
alter publication supabase_realtime add table gives;

-- Create a storage bucket for item images
insert into storage.buckets (id, name, public)
values ('item-images', 'item-images', true);

-- Set up Storage RLS
create policy "Item images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'item-images' );

create policy "Users can upload item images."
  on storage.objects for insert
  with check ( bucket_id = 'item-images' and auth.uid() = owner );
