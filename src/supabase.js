import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  // Ajuda a diagnosticar deploy sem variáveis de ambiente configuradas.
  console.error(
    'Variáveis VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY ausentes. ' +
      'Configure-as no .env (local) e na Vercel (deploy).'
  )
}

export const supabase = createClient(url, anonKey)
