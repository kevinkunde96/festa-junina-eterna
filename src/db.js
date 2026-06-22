import { supabase } from './supabase'

// --------------------------------------------------------------------
// Mapeadores snake_case (Postgres) -> camelCase (views)
// --------------------------------------------------------------------
const mapParticipante = (r) => ({
  id: r.id,
  nome: r.nome,
  sobrenome: r.sobrenome ?? '',
  saldo: Number(r.saldo) || 0,
  criadoEm: r.criado_em,
})

const mapItem = (r) => ({
  id: r.id,
  nome: r.nome,
  preco: Number(r.preco) || 0,
  ativo: !!r.ativo,
})

const mapTransacao = (r) => ({
  id: r.id,
  tipo: r.tipo,
  participanteId: r.participante_id,
  valor: r.valor == null ? undefined : Number(r.valor),
  itens: r.itens ?? undefined,
  total: r.total == null ? undefined : Number(r.total),
  data: r.data,
})

const check = ({ data, error }) => {
  if (error) throw new Error(error.message)
  return data
}

// --------------------------------------------------------------------
// Carga principal usada pelo App (participantes + itens)
// --------------------------------------------------------------------
export async function getDb() {
  const [participantes, itens] = await Promise.all([
    supabase.from('participantes').select('*').order('nome'),
    supabase.from('itens').select('*').order('nome'),
  ])
  return {
    participantes: check(participantes).map(mapParticipante),
    itens: check(itens).map(mapItem),
    transacoes: [],
  }
}

// --------------------------------------------------------------------
// Participantes
// --------------------------------------------------------------------
export async function addParticipante(nome, sobrenome, recargaInicial) {
  const data = check(
    await supabase
      .from('participantes')
      .insert({ nome: nome.trim(), sobrenome: sobrenome.trim() })
      .select()
      .single()
  )
  let p = mapParticipante(data)
  if (recargaInicial > 0) {
    p = await recarregar(p.id, recargaInicial)
  }
  return p
}

export async function recarregar(participanteId, valor) {
  const data = check(
    await supabase.rpc('recarregar', {
      p_participante: participanteId,
      p_valor: valor,
    })
  )
  return mapParticipante(data)
}

export async function consumir(participanteId, itensCarrinho) {
  const payload = itensCarrinho.map((i) => ({
    itemId: i.itemId,
    nome: i.nome,
    preco: i.preco,
    qtd: i.qtd,
  }))
  const data = check(
    await supabase.rpc('registrar_consumo', {
      p_participante: participanteId,
      p_itens: payload,
    })
  )
  return mapParticipante(data)
}

// --------------------------------------------------------------------
// Itens (catálogo)
// --------------------------------------------------------------------
export async function upsertItem(item) {
  const row = {
    nome: item.nome,
    preco: item.preco,
    ativo: item.ativo ?? true,
  }
  if (item.id) {
    check(await supabase.from('itens').update(row).eq('id', item.id))
  } else {
    check(await supabase.from('itens').insert(row))
  }
}

export async function removerItem(id) {
  check(await supabase.from('itens').delete().eq('id', id))
}

// --------------------------------------------------------------------
// Extrato
// --------------------------------------------------------------------
export async function listarExtrato(participanteId) {
  const data = check(
    await supabase
      .from('transacoes')
      .select('*')
      .eq('participante_id', participanteId)
      .order('data', { ascending: false })
  )
  return data.map(mapTransacao)
}

// --------------------------------------------------------------------
// Dashboard / relatório da festa
// --------------------------------------------------------------------
export async function getDashboard() {
  const [txRes, partRes] = await Promise.all([
    supabase.from('transacoes').select('*').order('data', { ascending: false }),
    supabase.from('participantes').select('*'),
  ])
  const txs = check(txRes).map(mapTransacao)
  const participantes = check(partRes).map(mapParticipante)

  let totalRecargas = 0
  let totalConsumo = 0
  let nRecargas = 0
  let nConsumos = 0
  const porItem = new Map()

  for (const t of txs) {
    if (t.tipo === 'RECARGA') {
      totalRecargas += t.valor || 0
      nRecargas++
    } else {
      totalConsumo += t.total || 0
      nConsumos++
      for (const i of t.itens || []) {
        const key = i.itemId || i.nome
        const cur = porItem.get(key) || { nome: i.nome, qtd: 0, receita: 0 }
        cur.qtd += Number(i.qtd) || 0
        cur.receita += (Number(i.preco) || 0) * (Number(i.qtd) || 0)
        porItem.set(key, cur)
      }
    }
  }

  const itensVendidos = [...porItem.values()].sort((a, b) => b.receita - a.receita)

  return {
    totalRecargas,
    totalConsumo,
    saldoEmAberto: participantes.reduce((s, p) => s + p.saldo, 0),
    nParticipantes: participantes.length,
    nRecargas,
    nConsumos,
    itensVendidos,
    qtdItensVendidos: itensVendidos.reduce((s, i) => s + i.qtd, 0),
  }
}

export const fmtBRL = (v) =>
  (Number(v) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
