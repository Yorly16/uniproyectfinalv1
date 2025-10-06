-- Crear tabla de conversaciones
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  collaboration_id uuid not null references public.collaborations (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  owner_id uuid not null references public.users (id) on delete cascade,
  collaborator_id uuid not null references public.users (id) on delete cascade,
  is_open boolean not null default true,
  last_message_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint conversations_unique_collaboration unique (collaboration_id)
);

-- Crear tabla de mensajes
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.users (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz null
);

-- Habilitar RLS
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

-- Políticas: solo participantes pueden ver o escribir
create policy "conversations_select_participants"
  on public.conversations
  for select
  using (auth.uid() = owner_id or auth.uid() = collaborator_id);

create policy "conversations_insert_owner"
  on public.conversations
  for insert
  with check (auth.uid() = owner_id);

create policy "conversations_update_participants"
  on public.conversations
  for update
  using (auth.uid() = owner_id or auth.uid() = collaborator_id)
  with check (auth.uid() = owner_id or auth.uid() = collaborator_id);

create policy "messages_select_participants"
  on public.messages
  for select
  using (
    exists (
      select 1
      from public.conversations c
      where c.id = messages.conversation_id
        and (auth.uid() = c.owner_id or auth.uid() = c.collaborator_id)
    )
  );

create policy "messages_insert_participants"
  on public.messages
  for insert
  with check (
    exists (
      select 1
      from public.conversations c
      where c.id = messages.conversation_id
        and (auth.uid() = c.owner_id or auth.uid() = c.collaborator_id)
        and auth.uid() = sender_id
    )
  );