import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabaseReady = Boolean(url && anonKey)

if (!supabaseReady) {
  // Ajuda a diagnosticar deploy sem variáveis de ambiente configuradas.
  console.error(
    'Variáveis VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY ausentes. ' +
      'Configure-as no .env (local) e na Vercel (deploy).'
  )
}

// Evita "tela branca": só cria o client se houver configuração.
export const supabase = supabaseReady ? createClient(url, anonKey) : null
