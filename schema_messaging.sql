-- Create a table for conversations
create table conversations (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  item_id uuid not null, -- References needs.id or gives.id (polymorphic-ish)
  item_type text not null check (item_type in ('need', 'give')),
  participant1_id uuid references profiles(id) on delete cascade not null,
  participant2_id uuid references profiles(id) on delete cascade not null,
  
  -- Ensure unique conversation per item between two people
  unique(item_id, participant1_id, participant2_id)
);

-- RLS for conversations
alter table conversations enable row level security;

create policy "Users can view their own conversations."
  on conversations for select
  using ( auth.uid() = participant1_id or auth.uid() = participant2_id );

create policy "Users can create conversations."
  on conversations for insert
  with check ( auth.uid() = participant1_id or auth.uid() = participant2_id );

-- Create a table for messages
create table messages (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  conversation_id uuid references conversations(id) on delete cascade not null,
  sender_id uuid references profiles(id) on delete cascade not null,
  content text not null,
  is_read boolean default false
);

-- RLS for messages
alter table messages enable row level security;

create policy "Users can view messages in their conversations."
  on messages for select
  using ( exists (
    select 1 from conversations
    where id = messages.conversation_id
    and (participant1_id = auth.uid() or participant2_id = auth.uid())
  ));

create policy "Users can insert messages in their conversations."
  on messages for insert
  with check ( exists (
    select 1 from conversations
    where id = messages.conversation_id
    and (participant1_id = auth.uid() or participant2_id = auth.uid())
  ));

-- Realtime
alter publication supabase_realtime add table messages;
