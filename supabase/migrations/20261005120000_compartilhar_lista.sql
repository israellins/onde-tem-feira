-- =============================================================================
-- Compartilhamento da lista de compras
--
-- O dono de uma lista pode compartilhá-la com outras pessoas cadastradas,
-- informando o e-mail delas. Quem recebe o compartilhamento pode ver, adicionar,
-- marcar e remover itens da lista do dono. Qualquer lado pode desfazer o
-- compartilhamento a qualquer momento.
-- =============================================================================

create table public.shopping_list_shares (
  owner_id      uuid not null references public.profiles (id) on delete cascade,
  member_id     uuid not null references public.profiles (id) on delete cascade,
  -- E-mail digitado pelo dono (para ele reconhecer com quem compartilhou).
  member_email  text not null check (char_length(member_email) between 3 and 254),
  created_at    timestamptz not null default now(),
  primary key (owner_id, member_id),
  check (owner_id <> member_id)
);

create index shopping_list_shares_member_idx on public.shopping_list_shares (member_id);

alter table public.shopping_list_shares enable row level security;

create policy "Dono e convidado veem o compartilhamento"
  on public.shopping_list_shares for select
  to authenticated
  using (owner_id = (select auth.uid()) or member_id = (select auth.uid()));

create policy "Dono remove convidado; convidado sai da lista"
  on public.shopping_list_shares for delete
  to authenticated
  using (owner_id = (select auth.uid()) or member_id = (select auth.uid()));

-- Sem política de insert: compartilhar só pela função share_shopping_list().

-- -----------------------------------------------------------------------------
-- Acesso à lista: dono ou convidado
-- -----------------------------------------------------------------------------
create or replace function public.can_access_shopping_list(list_owner uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select list_owner = (select auth.uid())
      or exists (
        select 1 from public.shopping_list_shares s
        where s.owner_id = list_owner and s.member_id = (select auth.uid())
      );
$$;

-- Quem adicionou cada item (para mostrar "adicionado por Maria").
alter table public.shopping_items
  add column added_by uuid default auth.uid() references public.profiles (id) on delete set null;

update public.shopping_items set added_by = user_id where added_by is null;

drop policy "Usuário gerencia a própria lista" on public.shopping_items;

create policy "Dono e convidados gerenciam a lista"
  on public.shopping_items for all
  to authenticated
  using (public.can_access_shopping_list(user_id))
  with check (public.can_access_shopping_list(user_id));

-- added_by é sempre definido pelo banco: no insert, quem está logado;
-- no update, nunca muda (ninguém se passa por outra pessoa).
create or replace function public.shopping_items_set_added_by()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.added_by := coalesce((select auth.uid()), new.added_by);
  else
    new.added_by := old.added_by;
  end if;
  return new;
end;
$$;

create trigger shopping_items_set_added_by
  before insert or update on public.shopping_items
  for each row execute function public.shopping_items_set_added_by();

-- -----------------------------------------------------------------------------
-- Compartilhar por e-mail
-- -----------------------------------------------------------------------------
create or replace function public.share_shopping_list(target_email text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid       uuid := (select auth.uid());
  v_email   text := lower(trim(target_email));
  v_member  uuid;
  v_name    text;
begin
  if uid is null then
    raise exception 'Não autenticado' using errcode = '42501';
  end if;
  if v_email is null or v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'Digite um e-mail válido.' using errcode = 'P0001';
  end if;
  if (select count(*) from public.shopping_list_shares where owner_id = uid) >= 20 then
    raise exception 'Limite de 20 pessoas por lista atingido.' using errcode = 'P0001';
  end if;

  select u.id into v_member from auth.users u where lower(u.email) = v_email;
  if v_member is null then
    raise exception 'Não encontramos ninguém com esse e-mail. A pessoa precisa entrar no app uma vez antes.'
      using errcode = 'P0001';
  end if;
  if v_member = uid then
    raise exception 'Esse é o seu próprio e-mail.' using errcode = 'P0001';
  end if;

  insert into public.shopping_list_shares (owner_id, member_id, member_email)
  values (uid, v_member, v_email)
  on conflict (owner_id, member_id) do nothing;

  select p.display_name into v_name from public.profiles p where p.id = v_member;
  return v_name;
end;
$$;

revoke execute on function public.share_shopping_list(text) from public, anon;
grant execute on function public.share_shopping_list(text) to authenticated;
