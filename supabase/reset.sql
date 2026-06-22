-- =====================================================================
-- App Junino · Eterna Semente — LIMPEZA dos dados (rodar no SQL Editor)
-- ATENÇÃO: apaga dados de verdade. Use antes do evento para começar limpo.
-- =====================================================================

-- Opção A) Zera tudo, MAS mantém o catálogo de produtos (itens).
--          Recomendado: remove participantes e movimentações de teste,
--          mas preserva os produtos/preços já cadastrados.
truncate table public.transacoes restart identity cascade;
delete from public.participantes;

-- Opção B) Zera TUDO, inclusive o catálogo de produtos.
--          Descomente as linhas abaixo se quiser apagar os itens também.
-- truncate table public.itens restart identity cascade;
