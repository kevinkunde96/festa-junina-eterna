import { useMemo, useState } from 'react'
import { fmtBRL, recarregar } from '../db'

export default function Caixa({ db, onChange, go }) {
  const [busca, setBusca] = useState('')
  const [selId, setSelId] = useState(null)
  const [valorRecarga, setValorRecarga] = useState('')

  const resultados = useMemo(() => {
    const q = busca.trim().toLowerCase()
    if (!q) return db.participantes.slice().sort((a, b) => a.nome.localeCompare(b.nome))
    return db.participantes.filter((p) =>
      `${p.nome} ${p.sobrenome}`.toLowerCase().includes(q)
    )
  }, [busca, db.participantes])

  const sel = db.participantes.find((p) => p.id === selId)

  async function fazerRecarga() {
    const v = parseFloat(valorRecarga.replace(',', '.'))
    if (!v || v <= 0) return alert('Valor inválido')
    await recarregar(sel.id, v)
    setValorRecarga('')
    onChange()
  }

  return (
    <div className="caixa">
      <div className="painel">
        <div className="busca-row">
          <input
            autoFocus
            placeholder="Buscar por nome ou sobrenome…"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          <button className="primary" onClick={() => go('novo')}>+ Novo participante</button>
        </div>

        <ul className="lista">
          {resultados.length === 0 && <li className="vazio">Nenhum participante.</li>}
          {resultados.map((p) => (
            <li
              key={p.id}
              className={p.id === selId ? 'sel' : ''}
              onClick={() => setSelId(p.id)}
            >
              <span>{p.nome} {p.sobrenome}</span>
              <strong>{fmtBRL(p.saldo)}</strong>
            </li>
          ))}
        </ul>
      </div>

      <div className="painel detalhe">
        {!sel && <p className="dica">Selecione um participante à esquerda.</p>}
        {sel && (
          <>
            <h2>{sel.nome} {sel.sobrenome}</h2>
            <div className="saldo-big">{fmtBRL(sel.saldo)}</div>

            <div className="acoes">
              <button
                className="primary grande"
                disabled={sel.saldo <= 0}
                onClick={() => go('consumo', sel.id)}
              >
                Registrar consumo
              </button>
              <button className="secundario grande" onClick={() => go('extrato', sel.id)}>
                Ver extrato
              </button>
            </div>

            <div className="recarga-box">
              <h3>Adicionar crédito</h3>
              <div className="recarga-row">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="R$ 0,00"
                  value={valorRecarga}
                  onChange={(e) => setValorRecarga(e.target.value)}
                />
                <button className="primary" onClick={fazerRecarga}>Recarregar</button>
              </div>
              <div className="atalhos">
                {[5, 10, 20, 50].map((v) => (
                  <button key={v} onClick={() => setValorRecarga(String(v))}>+R$ {v}</button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
