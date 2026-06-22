import { useEffect, useState } from 'react'
import { fmtBRL, getDashboard } from '../db'

export default function Dashboard() {
  const [d, setD] = useState(null)
  const [erro, setErro] = useState(null)

  const carregar = () => {
    setD(null)
    setErro(null)
    getDashboard().then(setD).catch((e) => setErro(e.message))
  }

  useEffect(carregar, [])

  if (erro) return <div className="painel"><p className="vazio">Erro ao carregar: {erro}</p></div>
  if (!d) return <div className="painel"><p>Carregando…</p></div>

  return (
    <div className="painel dashboard">
      <header className="cabec">
        <h2>Dashboard da Festa</h2>
        <button className="secundario" onClick={carregar}>Atualizar</button>
      </header>

      <div className="cards">
        <Card titulo="Total recarregado" valor={fmtBRL(d.totalRecargas)} sub={`${d.nRecargas} recargas`} cor="verde" />
        <Card titulo="Total consumido" valor={fmtBRL(d.totalConsumo)} sub={`${d.nConsumos} comandas`} cor="milho" />
        <Card titulo="Saldo em aberto" valor={fmtBRL(d.saldoEmAberto)} sub="créditos não usados" />
        <Card titulo="Participantes" valor={d.nParticipantes} sub={`${d.qtdItensVendidos} itens vendidos`} />
      </div>

      <h3 className="dash-sub">Itens vendidos</h3>
      {d.itensVendidos.length === 0 ? (
        <p className="vazio">Nenhuma venda registrada ainda.</p>
      ) : (
        <table className="tabela-vendas">
          <thead>
            <tr><th>Item</th><th className="num">Qtd</th><th className="num">Receita</th></tr>
          </thead>
          <tbody>
            {d.itensVendidos.map((i, ix) => (
              <tr key={ix}>
                <td>{i.nome}</td>
                <td className="num">{i.qtd}</td>
                <td className="num">{fmtBRL(i.receita)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td>Total</td>
              <td className="num">{d.qtdItensVendidos}</td>
              <td className="num">{fmtBRL(d.totalConsumo)}</td>
            </tr>
          </tfoot>
        </table>
      )}
    </div>
  )
}

function Card({ titulo, valor, sub, cor }) {
  return (
    <div className={`card ${cor || ''}`}>
      <span className="card-titulo">{titulo}</span>
      <strong className="card-valor">{valor}</strong>
      <span className="card-sub">{sub}</span>
    </div>
  )
}
