-- =====================================================================
-- App Junino · Eterna Semente — LIMPEZA dos dados (rodar no SQL Editor)
-- ATENÇÃO: apaga dados de verdade. Use antes do evento para começar limpo.
-- =====================================================================

-- Zera TUDO: movimentações, participantes E o catálogo de produtos.
-- (Para preservar o catálogo, remova a linha do truncate de public.itens.)
truncate table public.transacoes restart identity cascade;
delete from public.participantes;
truncate table public.itens restart identity cascade;
