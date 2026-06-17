import { useState } from 'react'
import { fmtBRL, consumir } from '../db'

export default function Consumo({ db, participanteId, onDone, onCancel }) {
  const p = db.participantes.find((x) => x.id === participanteId)
  const [carrinho, setCarrinho] = useState([])

  if (!p) return <p>Participante não encontrado.</p>

  const itensAtivos = db.itens.filter((i) => i.ativo)
  const total = carrinho.reduce((s, i) => s + i.preco * i.qtd, 0)
  const saldoApos = p.saldo - total
  const passou = saldoApos < 0

  function add(item) {
    setCarrinho((c) => {
      const ix = c.findIndex((x) => x.itemId === item.id)
      if (ix >= 0) {
        const novo = [...c]
        novo[ix] = { ...novo[ix], qtd: novo[ix].qtd + 1 }
        return novo
      }
      return [...c, { itemId: item.id, nome: item.nome, preco: item.preco, qtd: 1 }]
    })
  }

  function changeQtd(itemId, delta) {
    setCarrinho((c) =>
      c
        .map((x) => (x.itemId === itemId ? { ...x, qtd: x.qtd + delta } : x))
        .filter((x) => x.qtd > 0)
    )
  }

  async function confirmar() {
    if (carrinho.length === 0) return
    if (passou) return alert('Saldo insuficiente')
    try {
      await consumir(p.id, carrinho)
      onDone()
    } catch (e) {
      alert(e.message)
    }
  }

  return (
    <div className="consumo">
      <div className="painel">
        <header className="cabec">
          <div>
            <h2>{p.nome} {p.sobrenome}</h2>
            <div className="saldo-mini">Saldo: <strong>{fmtBRL(p.saldo)}</strong></div>
          </div>
          <button className="secundario" onClick={onCancel}>Voltar</button>
        </header>

        {itensAtivos.length === 0 && (
          <p className="vazio">Nenhum item ativo no catálogo. Cadastre itens primeiro.</p>
        )}
        <div className="grade-itens">
          {itensAtivos.map((it) => (
            <button key={it.id} className="card-item" onClick={() => add(it)}>
              <span className="nome">{it.nome}</span>
              <span className="preco">{fmtBRL(it.preco)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="painel carrinho">
        <h2>Comanda</h2>
        {carrinho.length === 0 && <p className="vazio">Toque nos itens para adicionar.</p>}
        <ul>
          {carrinho.map((c) => (
            <li key={c.itemId}>
              <div className="ci-nome">
                <strong>{c.nome}</strong>
                <small>{fmtBRL(c.preco)} cada</small>
              </div>
              <div className="ci-qtd">
                <button onClick={() => changeQtd(c.itemId, -1)}>−</button>
                <span>{c.qtd}</span>
                <button onClick={() => changeQtd(c.itemId, +1)}>+</button>
              </div>
              <div className="ci-sub">{fmtBRL(c.preco * c.qtd)}</div>
            </li>
          ))}
        </ul>

        <div className="totais">
          <div>Total: <strong>{fmtBRL(total)}</strong></div>
          <div className={passou ? 'erro' : ''}>
            Saldo após: <strong>{fmtBRL(saldoApos)}</strong>
          </div>
        </div>

        <button
          className="primary grande"
          disabled={carrinho.length === 0 || passou}
          onClick={confirmar}
        >
          Confirmar consumo
        </button>
      </div>
    </div>
  )
}
