-- ============================================================================
-- 0001_chats.sql
-- Tabelle cmta_chats + cmta_messages per la persistenza delle conversazioni
-- PDMD-TA. Eseguire una sola volta (Supabase Studio → SQL Editor o via CLI).
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---- cmta_chats ------------------------------------------------------------

create table if not exists public.cmta_chats (
  id          uuid primary key default gen_random_uuid(),
  title       text not null default 'Nuova chat',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists cmta_chats_updated_at_idx
  on public.cmta_chats (updated_at desc);

-- ---- cmta_messages ---------------------------------------------------------

create table if not exists public.cmta_messages (
  id           uuid primary key default gen_random_uuid(),
  chat_id      uuid not null references public.cmta_chats(id) on delete cascade,
  role         text not null check (role in ('user', 'assistant')),
  content      text not null default '',
  attachments  jsonb,
  created_at   timestamptz not null default now()
);

create index if not exists cmta_messages_chat_id_created_at_idx
  on public.cmta_messages (chat_id, created_at asc);

-- ---- trigger: updated_at automatico ----------------------------------------

create or replace function public.cmta_touch_chats_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists cmta_chats_touch_updated_at on public.cmta_chats;
create trigger cmta_chats_touch_updated_at
  before update on public.cmta_chats
  for each row
  execute function public.cmta_touch_chats_updated_at();

-- Quando arriva un nuovo messaggio, bump dell'updated_at della chat
-- (così la lista resta ordinata per attività recente).
create or replace function public.cmta_bump_chat_on_message()
returns trigger
language plpgsql
as $$
begin
  update public.cmta_chats set updated_at = now() where id = new.chat_id;
  return new;
end;
$$;

drop trigger if exists cmta_messages_bump_chat on public.cmta_messages;
create trigger cmta_messages_bump_chat
  after insert on public.cmta_messages
  for each row
  execute function public.cmta_bump_chat_on_message();
