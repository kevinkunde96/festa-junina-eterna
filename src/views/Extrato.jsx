import { useEffect, useState } from 'react'
import { fmtBRL, listarExtrato } from '../db'

const fmtData = (iso) =>
  new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

export default function Extrato({ db, participanteId, onBack }) {
  const p = db.participantes.find((x) => x.id === participanteId)
  const [txs, setTxs] = useState([])

  useEffect(() => {
    listarExtrato(participanteId).then(setTxs)
  }, [participanteId])

  if (!p) return <p>Participante não encontrado.</p>

  return (
    <div className="painel extrato">
      <header className="cabec">
        <div>
          <h2>Extrato — {p.nome} {p.sobrenome}</h2>
          <div className="saldo-mini">Saldo atual: <strong>{fmtBRL(p.saldo)}</strong></div>
        </div>
        <button className="secundario" onClick={onBack}>Voltar</button>
      </header>

      {txs.length === 0 && <p className="vazio">Sem movimentações ainda.</p>}
      <ul className="lista-extrato">
        {txs.map((t) => (
          <li key={t.id} className={t.tipo === 'RECARGA' ? 'rec' : 'cons'}>
            <div className="head">
              <span className="tag">{t.tipo === 'RECARGA' ? 'Recarga' : 'Consumo'}</span>
              <span className="data">{fmtData(t.data)}</span>
              <strong className="val">
                {t.tipo === 'RECARGA' ? '+' : '−'} {fmtBRL(t.tipo === 'RECARGA' ? t.valor : t.total)}
              </strong>
            </div>
            {t.tipo === 'CONSUMO' && (
              <ul className="sub">
                {t.itens.map((i, ix) => (
                  <li key={ix}>{i.qtd}× {i.nome} <span>{fmtBRL(i.preco * i.qtd)}</span></li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
