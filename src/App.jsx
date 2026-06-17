import { useEffect, useState } from 'react'
import { getDb } from './db'
import { supabase } from './supabase'
import Caixa from './views/Caixa'
import NovoParticipante from './views/NovoParticipante'
import Catalogo from './views/Catalogo'
import Consumo from './views/Consumo'
import Extrato from './views/Extrato'
import Login from './views/Login'

export default function App() {
  const [view, setView] = useState('caixa')
  const [participanteId, setParticipanteId] = useState(null)
  const [refresh, setRefresh] = useState(0)
  const [db, setDb] = useState(null)
  const [session, setSession] = useState(null)
  const [authPronto, setAuthPronto] = useState(false)

  const reload = () => setRefresh((x) => x + 1)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setAuthPronto(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s)
      setDb(null)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (session) getDb().then(setDb)
  }, [refresh, session])

  const go = (v, pid = null) => {
    setParticipanteId(pid)
    setView(v)
  }

  if (!authPronto) return <div className="app"><p>Carregando…</p></div>
  if (!session) return <Login />
  if (!db) return <div className="app"><p>Carregando…</p></div>

  return (
    <div className="app">
      <header className="top">
        <h1>
          <img className="logo" src="/eterna.jpg" alt="Movimento Eterna Semente" onError={(e) => (e.target.style.display = 'none')} />
          Festa Junina · Eterna Semente
        </h1>
        <nav>
          <button className={view === 'caixa' ? 'on' : ''} onClick={() => go('caixa')}>Caixa</button>
          <button className={view === 'catalogo' ? 'on' : ''} onClick={() => go('catalogo')}>Catálogo</button>
          <button className="sair" onClick={() => supabase.auth.signOut()}>Sair</button>
        </nav>
      </header>
      <main>
        {view === 'caixa' && <Caixa db={db} onChange={reload} go={go} />}
        {view === 'novo' && <NovoParticipante onDone={(pid) => { reload(); go('caixa', pid) }} onCancel={() => go('caixa')} />}
        {view === 'catalogo' && <Catalogo db={db} onChange={reload} />}
        {view === 'consumo' && <Consumo db={db} participanteId={participanteId} onDone={() => { reload(); go('caixa', participanteId) }} onCancel={() => go('caixa', participanteId)} />}
        {view === 'extrato' && <Extrato db={db} participanteId={participanteId} onBack={() => go('caixa', participanteId)} />}
      </main>
    </div>
  )
}
