import { useState } from 'react'
import { addParticipante } from '../db'

export default function NovoParticipante({ onDone, onCancel }) {
  const [nome, setNome] = useState('')
  const [sobrenome, setSobrenome] = useState('')
  const [valor, setValor] = useState('')

  async function salvar(e) {
    e.preventDefault()
    if (!nome.trim() || !sobrenome.trim()) return alert('Informe nome e sobrenome')
    const v = parseFloat((valor || '0').replace(',', '.')) || 0
    if (v < 0) return alert('Valor inválido')
    const p = await addParticipante(nome, sobrenome, v)
    onDone(p.id)
  }

  return (
    <form className="painel form" onSubmit={salvar}>
      <h2>Novo participante</h2>
      <label>Nome
        <input autoFocus value={nome} onChange={(e) => setNome(e.target.value)} />
      </label>
      <label>Sobrenome
        <input value={sobrenome} onChange={(e) => setSobrenome(e.target.value)} />
      </label>
      <label>Recarga inicial (opcional)
        <input
          type="text"
          inputMode="decimal"
          placeholder="R$ 0,00"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
        />
      </label>
      <div className="acoes">
        <button type="button" className="secundario" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="primary">Salvar</button>
      </div>
    </form>
  )
}
