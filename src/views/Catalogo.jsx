import { useState } from 'react'
import { fmtBRL, upsertItem, removerItem } from '../db'

export default function Catalogo({ db, onChange }) {
  const [nome, setNome] = useState('')
  const [preco, setPreco] = useState('')
  const [editando, setEditando] = useState(null)

  async function salvar(e) {
    e.preventDefault()
    const p = parseFloat(preco.replace(',', '.'))
    if (!nome.trim() || !p || p <= 0) return alert('Informe nome e preço válidos')
    const payload = { nome: nome.trim(), preco: p, ativo: editando ? editando.ativo : true }
    if (editando?.id) payload.id = editando.id
    await upsertItem(payload)
    setNome(''); setPreco(''); setEditando(null)
    onChange()
  }

  function editar(it) {
    setEditando(it); setNome(it.nome); setPreco(String(it.preco))
  }

  async function toggleAtivo(it) {
    await upsertItem({ ...it, ativo: !it.ativo })
    onChange()
  }

  async function excluir(it) {
    if (!confirm(`Remover "${it.nome}"?`)) return
    await removerItem(it.id)
    onChange()
  }

  return (
    <div className="catalogo">
      <form className="painel form" onSubmit={salvar}>
        <h2>{editando ? 'Editar item' : 'Novo item'}</h2>
        <label>Nome
          <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Refrigerante" />
        </label>
        <label>Preço
          <input
            type="text" inputMode="decimal" placeholder="R$ 0,00"
            value={preco} onChange={(e) => setPreco(e.target.value)}
          />
        </label>
        <div className="acoes">
          {editando && (
            <button type="button" className="secundario" onClick={() => { setEditando(null); setNome(''); setPreco('') }}>
              Cancelar
            </button>
          )}
          <button type="submit" className="primary">{editando ? 'Atualizar' : 'Adicionar'}</button>
        </div>
      </form>

      <div className="painel">
        <h2>Itens cadastrados</h2>
        {db.itens.length === 0 && <p className="vazio">Nenhum item ainda.</p>}
        <ul className="lista-itens">
          {db.itens.map((it) => (
            <li key={it.id} className={it.ativo ? '' : 'inativo'}>
              <div>
                <strong>{it.nome}</strong>
                <span>{fmtBRL(it.preco)}</span>
              </div>
              <div className="row-actions">
                <button onClick={() => toggleAtivo(it)}>{it.ativo ? 'Desativar' : 'Ativar'}</button>
                <button onClick={() => editar(it)}>Editar</button>
                <button className="danger" onClick={() => excluir(it)}>Remover</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
