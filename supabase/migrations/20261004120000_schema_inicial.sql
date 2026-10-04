-- =============================================================================
-- Onde tem feira — esquema inicial
--
-- Tabelas:
--   profiles             perfil público de cada usuário (nome e avatar)
--   feiras               catálogo de feiras exibido no mapa
--   posts                relatos do mural (texto, nota, preços, foto)
--   post_reports         denúncias de relatos
--   shopping_items       lista de compras de cada usuário (privada)
--   feira_confirmations  "estive lá e a feira está funcionando / não existe mais"
--   feira_suggestions    sugestões de nova feira ou de correção (moderadas)
--
-- Segurança: RLS ligado em todas as tabelas. Usuários anônimos só leem dados
-- públicos; cada usuário só escreve os próprios registros; mudanças no catálogo
-- de feiras só acontecem por funções que exigem administrador.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Perfis
-- -----------------------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 60),
  avatar_url  text check (avatar_url is null or avatar_url ~ '^https://'),
  is_admin    boolean not null default false,
  created_at  timestamptz not null default now()
);

comment on table public.profiles is 'Perfil público. Nunca guarde e-mail aqui.';

alter table public.profiles enable row level security;

create policy "Perfis são públicos"
  on public.profiles for select
  using (true);

create policy "Usuário edita o próprio perfil"
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Impede que um usuário se promova a administrador pelo update acima.
create or replace function public.protect_profile_admin_flag()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  -- Pela API (papéis anon/authenticated) ninguém altera is_admin.
  -- Pelo SQL Editor do Supabase (papel postgres) é permitido.
  if new.is_admin is distinct from old.is_admin
     and current_user in ('anon', 'authenticated') then
    raise exception 'Não é permitido alterar is_admin';
  end if;
  return new;
end;
$$;

create trigger profiles_protect_admin
  before update on public.profiles
  for each row execute function public.protect_profile_admin_flag();

-- Cria o perfil automaticamente quando alguém se cadastra.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name   text;
  v_avatar text;
begin
  v_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
    split_part(coalesce(new.email, 'feirante'), '@', 1)
  );
  v_avatar := new.raw_user_meta_data ->> 'avatar_url';
  if v_avatar is not null and v_avatar !~ '^https://' then
    v_avatar := null;
  end if;

  insert into public.profiles (id, display_name, avatar_url)
  values (new.id, left(v_name, 60), v_avatar);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select p.is_admin from public.profiles p where p.id = (select auth.uid())),
    false
  );
$$;

-- -----------------------------------------------------------------------------
-- Feiras
-- -----------------------------------------------------------------------------
create table public.feiras (
  id            text primary key check (id ~ '^[a-z0-9-]{3,80}$'),
  name          text not null check (char_length(name) between 2 and 120),
  city          text not null check (char_length(city) between 2 and 60),
  neighborhood  text not null check (char_length(neighborhood) between 1 and 80),
  lat           double precision not null check (lat between -34 and 6),
  lng           double precision not null check (lng between -74 and -34),
  days_of_week  text[] not null check (
    cardinality(days_of_week) between 1 and 7
    and days_of_week <@ array['domingo','segunda','terca','quarta','quinta','sexta','sabado']
  ),
  hours         text check (hours is null or char_length(hours) <= 40),
  address       text check (address is null or char_length(address) <= 200),
  source        text not null check (char_length(source) between 2 and 400),
  accuracy      text not null default 'approximate'
                check (accuracy in ('official_coords', 'approximate')),
  verified      boolean not null default false,
  active        boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index feiras_city_idx on public.feiras (city) where active;

alter table public.feiras enable row level security;

create policy "Feiras ativas são públicas"
  on public.feiras for select
  using (active or public.is_admin());

-- Sem políticas de insert/update/delete: só funções security definer
-- (approve_suggestion) ou o painel do Supabase alteram o catálogo.

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger feiras_touch
  before update on public.feiras
  for each row execute function public.touch_updated_at();

-- -----------------------------------------------------------------------------
-- Mural: relatos
-- -----------------------------------------------------------------------------
create or replace function public.valid_price_reports(reports jsonb)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select jsonb_typeof(reports) = 'array'
     and jsonb_array_length(reports) <= 10
     and not exists (
       select 1
       from jsonb_array_elements(reports) r
       where jsonb_typeof(r) <> 'object'
          or jsonb_typeof(r -> 'product') <> 'string'
          or jsonb_typeof(r -> 'price') <> 'string'
          or char_length(r ->> 'product') not between 1 and 60
          or char_length(r ->> 'price') not between 1 and 30
     );
$$;

create table public.posts (
  id             uuid primary key default gen_random_uuid(),
  feira_id       text not null references public.feiras (id) on delete cascade,
  user_id        uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  text           text not null check (char_length(trim(text)) between 1 and 1000),
  rating         smallint check (rating between 1 and 5),
  price_reports  jsonb not null default '[]'::jsonb check (public.valid_price_reports(price_reports)),
  photo_path     text check (photo_path is null or photo_path ~ '^[0-9a-f-]{36}/[A-Za-z0-9._-]{1,100}$'),
  hidden         boolean not null default false,
  created_at     timestamptz not null default now()
);

create index posts_feira_created_idx on public.posts (feira_id, created_at desc) where not hidden;

alter table public.posts enable row level security;

create policy "Relatos visíveis são públicos"
  on public.posts for select
  using (not hidden or user_id = (select auth.uid()) or public.is_admin());

create policy "Usuário publica relato em seu nome"
  on public.posts for insert
  to authenticated
  with check (user_id = (select auth.uid()) and hidden = false);

create policy "Usuário apaga o próprio relato; admin apaga qualquer um"
  on public.posts for delete
  to authenticated
  using (user_id = (select auth.uid()) or public.is_admin());

create policy "Admin modera relatos"
  on public.posts for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Limite simples contra spam: no máximo 10 relatos por usuário a cada hora.
create or replace function public.posts_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select count(*) from public.posts
      where user_id = new.user_id and created_at > now() - interval '1 hour') >= 10 then
    raise exception 'Limite de relatos atingido. Tente novamente mais tarde.'
      using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger posts_rate_limit
  before insert on public.posts
  for each row execute function public.posts_rate_limit();

-- -----------------------------------------------------------------------------
-- Denúncias
-- -----------------------------------------------------------------------------
create table public.post_reports (
  post_id     uuid not null references public.posts (id) on delete cascade,
  user_id     uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  reason      text not null check (char_length(trim(reason)) between 1 and 300),
  created_at  timestamptz not null default now(),
  primary key (post_id, user_id)
);

alter table public.post_reports enable row level security;

create policy "Usuário denuncia em seu nome"
  on public.post_reports for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy "Usuário vê as próprias denúncias; admin vê todas"
  on public.post_reports for select
  to authenticated
  using (user_id = (select auth.uid()) or public.is_admin());

create policy "Admin resolve denúncias"
  on public.post_reports for delete
  to authenticated
  using (public.is_admin());

-- -----------------------------------------------------------------------------
-- Lista de compras (privada)
-- -----------------------------------------------------------------------------
create table public.shopping_items (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null default auth.uid() references auth.users (id) on delete cascade,
  item            text not null check (char_length(trim(item)) between 1 and 80),
  quantity        text not null default '1 un' check (char_length(quantity) between 1 and 30),
  price_estimate  numeric(10, 2) check (price_estimate is null or price_estimate between 0 and 100000),
  category        text not null default 'outros'
                  check (category in ('frutas','legumes','pasteis','peixes','temperos','outros')),
  completed       boolean not null default false,
  created_at      timestamptz not null default now()
);

create index shopping_items_user_idx on public.shopping_items (user_id, created_at desc);

alter table public.shopping_items enable row level security;

create policy "Usuário gerencia a própria lista"
  on public.shopping_items for all
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- -----------------------------------------------------------------------------
-- Confirmações de funcionamento
-- -----------------------------------------------------------------------------
create table public.feira_confirmations (
  feira_id      text not null references public.feiras (id) on delete cascade,
  user_id       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  status        text not null check (status in ('funcionando', 'nao_encontrada')),
  confirmed_on  date not null default current_date,
  created_at    timestamptz not null default now(),
  primary key (feira_id, user_id, confirmed_on)
);

alter table public.feira_confirmations enable row level security;

create policy "Usuário vê as próprias confirmações"
  on public.feira_confirmations for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "Usuário confirma em seu nome"
  on public.feira_confirmations for insert
  to authenticated
  with check (user_id = (select auth.uid()) and confirmed_on = current_date);

create policy "Usuário corrige a confirmação de hoje"
  on public.feira_confirmations for update
  to authenticated
  using (user_id = (select auth.uid()) and confirmed_on = current_date)
  with check (user_id = (select auth.uid()) and confirmed_on = current_date);

-- Resumo público e anônimo (não expõe quem confirmou).
create or replace function public.feira_confirmation_stats()
returns table (
  feira_id text,
  confirmations_30d bigint,
  not_found_30d bigint,
  last_confirmed_on date
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    c.feira_id,
    count(*) filter (where c.status = 'funcionando'),
    count(*) filter (where c.status = 'nao_encontrada'),
    max(c.confirmed_on) filter (where c.status = 'funcionando')
  from public.feira_confirmations c
  where c.confirmed_on > current_date - 30
  group by c.feira_id;
$$;

-- -----------------------------------------------------------------------------
-- Sugestões (nova feira ou correção) — moderadas por administrador
-- -----------------------------------------------------------------------------
create table public.feira_suggestions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  kind         text not null check (kind in ('nova', 'alteracao')),
  feira_id     text references public.feiras (id) on delete cascade,
  payload      jsonb not null check (jsonb_typeof(payload) = 'object' and pg_column_size(payload) < 4000),
  comment      text check (comment is null or char_length(comment) <= 500),
  status       text not null default 'pendente' check (status in ('pendente', 'aprovada', 'rejeitada')),
  review_note  text check (review_note is null or char_length(review_note) <= 500),
  reviewed_by  uuid references public.profiles (id),
  reviewed_at  timestamptz,
  created_at   timestamptz not null default now(),
  check ((kind = 'nova' and feira_id is null) or (kind = 'alteracao' and feira_id is not null))
);

create index feira_suggestions_status_idx on public.feira_suggestions (status, created_at);

alter table public.feira_suggestions enable row level security;

create policy "Usuário envia sugestão em seu nome"
  on public.feira_suggestions for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and status = 'pendente'
    and reviewed_by is null
    and reviewed_at is null
    and review_note is null
  );

create policy "Usuário vê as próprias sugestões; admin vê todas"
  on public.feira_suggestions for select
  to authenticated
  using (user_id = (select auth.uid()) or public.is_admin());

-- Limite: 20 sugestões por usuário por dia.
create or replace function public.suggestions_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select count(*) from public.feira_suggestions
      where user_id = new.user_id and created_at > now() - interval '1 day') >= 20 then
    raise exception 'Limite diário de sugestões atingido.' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger suggestions_rate_limit
  before insert on public.feira_suggestions
  for each row execute function public.suggestions_rate_limit();

-- Converte o nome em um id: "Feira da Praça" + "São Paulo" -> "sp-feira-da-praca-ab12cd"
create or replace function public.slugify(value text)
returns text
language sql
immutable
set search_path = ''
as $$
  select trim(both '-' from regexp_replace(
    lower(translate(value,
      'áàâãäéèêëíìîïóòôõöúùûüçñÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑ',
      'aaaaaeeeeiiiiooooouuuucnaaaaaeeeeiiiiooooouuuucn')),
    '[^a-z0-9]+', '-', 'g'));
$$;

-- Aprovar uma sugestão aplica a mudança no catálogo de feiras.
create or replace function public.approve_suggestion(suggestion_id uuid, note text default null)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  s        public.feira_suggestions;
  p        jsonb;
  new_id   text;
  v_days   text[];
begin
  if not public.is_admin() then
    raise exception 'Apenas administradores podem aprovar sugestões' using errcode = '42501';
  end if;

  select * into s from public.feira_suggestions where id = suggestion_id for update;
  if not found then
    raise exception 'Sugestão não encontrada';
  end if;
  if s.status <> 'pendente' then
    raise exception 'Sugestão já revisada';
  end if;

  p := s.payload;
  if p ? 'daysOfWeek' then
    select array_agg(value) into v_days from jsonb_array_elements_text(p -> 'daysOfWeek');
  end if;

  if s.kind = 'nova' then
    new_id := left(public.slugify((p ->> 'city') || '-' || (p ->> 'name')), 70)
              || '-' || substr(replace(s.id::text, '-', ''), 1, 6);
    insert into public.feiras (id, name, city, neighborhood, lat, lng, days_of_week,
                               hours, address, source, accuracy, verified)
    values (
      new_id,
      p ->> 'name',
      p ->> 'city',
      p ->> 'neighborhood',
      (p ->> 'lat')::double precision,
      (p ->> 'lng')::double precision,
      v_days,
      nullif(p ->> 'hours', ''),
      nullif(p ->> 'address', ''),
      'Sugestão da comunidade (aprovada em ' || to_char(now(), 'DD/MM/YYYY') || ')',
      'approximate',
      false
    );
  else
    new_id := s.feira_id;
    update public.feiras f set
      name         = coalesce(p ->> 'name', f.name),
      neighborhood = coalesce(p ->> 'neighborhood', f.neighborhood),
      address      = case when p ? 'address' then nullif(p ->> 'address', '') else f.address end,
      hours        = case when p ? 'hours' then nullif(p ->> 'hours', '') else f.hours end,
      days_of_week = coalesce(v_days, f.days_of_week),
      lat          = coalesce((p ->> 'lat')::double precision, f.lat),
      lng          = coalesce((p ->> 'lng')::double precision, f.lng),
      active       = coalesce((p ->> 'active')::boolean, f.active)
    where f.id = s.feira_id;
  end if;

  update public.feira_suggestions
     set status = 'aprovada', review_note = note,
         reviewed_by = (select auth.uid()), reviewed_at = now()
   where id = suggestion_id;

  return new_id;
end;
$$;

create or replace function public.reject_suggestion(suggestion_id uuid, note text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Apenas administradores podem rejeitar sugestões' using errcode = '42501';
  end if;
  update public.feira_suggestions
     set status = 'rejeitada', review_note = note,
         reviewed_by = (select auth.uid()), reviewed_at = now()
   where id = suggestion_id and status = 'pendente';
  if not found then
    raise exception 'Sugestão não encontrada ou já revisada';
  end if;
end;
$$;

-- Funções administrativas não devem ser chamadas por anônimos.
revoke execute on function public.approve_suggestion(uuid, text) from public, anon;
revoke execute on function public.reject_suggestion(uuid, text) from public, anon;
grant execute on function public.approve_suggestion(uuid, text) to authenticated;
grant execute on function public.reject_suggestion(uuid, text) to authenticated;

-- -----------------------------------------------------------------------------
-- Storage: fotos dos relatos
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('post-photos', 'post-photos', true, 5242880,
        array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "Usuário envia fotos para a própria pasta"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'post-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Usuário apaga as próprias fotos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'post-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- -----------------------------------------------------------------------------
-- Exclusão de conta (exigência da Google Play e da LGPD)
-- Apaga o usuário; perfil, relatos, lista, confirmações e sugestões são
-- removidos em cascata. As fotos são apagadas pelo app antes desta chamada.
-- -----------------------------------------------------------------------------
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
begin
  if uid is null then
    raise exception 'Não autenticado' using errcode = '42501';
  end if;
  -- Revisões feitas por este usuário (se admin) perdem só a referência.
  update public.feira_suggestions set reviewed_by = null where reviewed_by = uid;
  delete from auth.users where id = uid;
end;
$$;

revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
