-- =====================================================================
-- App Junino · Eterna Semente — esquema Supabase (Postgres)
-- Rode este script inteiro no SQL Editor do Supabase (uma vez).
-- =====================================================================

-- --------------------------------------------------------------------
-- Tabelas
-- --------------------------------------------------------------------
create table if not exists public.participantes (
  id         uuid primary key default gen_random_uuid(),
  nome       text not null,
  sobrenome  text not null default '',
  saldo      numeric(10, 2) not null default 0,
  criado_em  timestamptz not null default now()
);

create table if not exists public.itens (
  id     uuid primary key default gen_random_uuid(),
  nome   text not null,
  preco  numeric(10, 2) not null,
  ativo  boolean not null default true
);

create table if not exists public.transacoes (
  id              uuid primary key default gen_random_uuid(),
  tipo            text not null check (tipo in ('RECARGA', 'CONSUMO')),
  participante_id uuid not null references public.participantes (id) on delete cascade,
  valor           numeric(10, 2),          -- usado em RECARGA
  itens           jsonb,                   -- usado em CONSUMO: [{itemId,nome,preco,qtd}]
  total           numeric(10, 2),          -- usado em CONSUMO
  data            timestamptz not null default now()
);

create index if not exists transacoes_participante_idx
  on public.transacoes (participante_id, data desc);

-- --------------------------------------------------------------------
-- Funções atômicas (saldo + transação numa só operação)
-- --------------------------------------------------------------------
create or replace function public.recarregar(p_participante uuid, p_valor numeric)
returns public.participantes
language plpgsql
security definer
set search_path = public
as $$
declare
  res public.participantes;
begin
  if p_valor is null or p_valor <= 0 then
    raise exception 'Valor inválido';
  end if;

  update public.participantes
     set saldo = round(saldo + p_valor, 2)
   where id = p_participante
   returning * into res;

  if res.id is null then
    raise exception 'Participante não encontrado';
  end if;

  insert into public.transacoes (tipo, participante_id, valor)
  values ('RECARGA', p_participante, p_valor);

  return res;
end;
$$;

create or replace function public.registrar_consumo(p_participante uuid, p_itens jsonb)
returns public.participantes
language plpgsql
security definer
set search_path = public
as $$
declare
  res    public.participantes;
  v_total numeric(10, 2);
begin
  select coalesce(sum((i ->> 'preco')::numeric * (i ->> 'qtd')::numeric), 0)
    into v_total
    from jsonb_array_elements(p_itens) as i;

  if v_total <= 0 then
    raise exception 'Comanda vazia';
  end if;

  update public.participantes
     set saldo = round(saldo - v_total, 2)
   where id = p_participante
     and saldo >= v_total
   returning * into res;

  if res.id is null then
    raise exception 'Saldo insuficiente ou participante não encontrado';
  end if;

  insert into public.transacoes (tipo, participante_id, itens, total)
  values ('CONSUMO', p_participante, p_itens, v_total);

  return res;
end;
$$;

-- --------------------------------------------------------------------
-- Row Level Security: somente usuários autenticados acessam.
-- --------------------------------------------------------------------
alter table public.participantes enable row level security;
alter table public.itens        enable row level security;
alter table public.transacoes   enable row level security;

drop policy if exists "auth full participantes" on public.participantes;
create policy "auth full participantes" on public.participantes
  for all to authenticated using (true) with check (true);

drop policy if exists "auth full itens" on public.itens;
create policy "auth full itens" on public.itens
  for all to authenticated using (true) with check (true);

drop policy if exists "auth full transacoes" on public.transacoes;
create policy "auth full transacoes" on public.transacoes
  for all to authenticated using (true) with check (true);
