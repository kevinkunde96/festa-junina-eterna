# App Junino · Eterna Semente

Sistema de caixa para a festa junina (recargas, consumo, catálogo e extrato).
Versão web com **Supabase** (banco + login) hospedada na **Vercel**.

## Stack
- React + Vite (SPA)
- Supabase (Postgres + Auth)
- Deploy na Vercel

## Rodar localmente

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Crie o arquivo `.env` a partir do exemplo e preencha com as chaves do Supabase:
   ```bash
   cp .env.example .env
   ```
3. Suba o dev server:
   ```bash
   npm run dev
   ```

## Configurar o Supabase (uma vez)

1. Crie um projeto em https://supabase.com.
2. Em **SQL Editor**, cole e rode todo o conteúdo de [`supabase/schema.sql`](supabase/schema.sql).
   Isso cria as tabelas (`participantes`, `itens`, `transacoes`), as funções de
   saldo e as políticas de segurança (RLS) — só usuários logados acessam.
3. Em **Authentication → Providers**, deixe **Email** habilitado.
   (Opcional: desative "Confirm email" para criar usuários sem confirmação.)
4. Em **Authentication → Users → Add user**, crie o usuário (e-mail + senha)
   que vai operar o caixa.
5. Em **Project Settings → API**, copie:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` key → `VITE_SUPABASE_ANON_KEY`

   Cole esses valores no seu `.env` local.

## Deploy na Vercel

1. Suba este repositório para o GitHub.
2. Na Vercel, **Add New → Project** e importe o repositório.
   - Framework: **Vite** (detectado automaticamente)
   - Build Command: `npm run build` · Output: `dist`
3. Em **Settings → Environment Variables**, adicione (para Production e Preview):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. **Deploy**. O `vercel.json` já cuida do roteamento SPA.

> A cada novo `push` na branch principal a Vercel publica automaticamente.

## Estrutura
- `src/supabase.js` — cliente Supabase
- `src/db.js` — camada de dados (todas as operações de caixa)
- `src/views/` — telas (Caixa, Catálogo, Consumo, Extrato, Novo participante, Login)
- `supabase/schema.sql` — esquema do banco
