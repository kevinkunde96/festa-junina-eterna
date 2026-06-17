import { useState } from 'react'
import { supabase } from '../supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function entrar(e) {
    e.preventDefault()
    setErro('')
    setCarregando(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: senha,
    })
    setCarregando(false)
    if (error) setErro('E-mail ou senha inválidos.')
  }

  return (
    <div className="login-wrap">
      <form className="painel form login-card" onSubmit={entrar}>
        <img
          className="logo-login"
          src="/eterna.jpg"
          alt="Movimento Eterna Semente"
          onError={(e) => (e.target.style.display = 'none')}
        />
        <h2>Festa Junina · Eterna Semente</h2>
        <label>E-mail
          <input
            type="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@exemplo.com"
          />
        </label>
        <label>Senha
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
        </label>
        {erro && <p className="login-erro">{erro}</p>}
        <button type="submit" className="primary grande" disabled={carregando}>
          {carregando ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}
