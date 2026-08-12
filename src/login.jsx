import { useState } from 'react'
import { supabase } from './lib/supabaseClient'

export default function Login() {
  const [mode, setMode] = useState('signin') // 'signin' or 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
      } else {
        setMessage('Check your email to confirm your account before signing in.')
      }
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080C16' }}>
      <form onSubmit={handleSubmit} style={{ background: '#0E1526', padding: 32, borderRadius: 12, width: 320 }}>
        <h1 style={{ color: '#E8EDF5', marginBottom: 4 }}>Thread</h1>
        <p style={{ color: '#7A8AA6', fontSize: 13, marginBottom: 16 }}>
          {mode === 'signin' ? 'Sign in to continue' : 'Create your account'}
        </p>

        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{ width: '100%', padding: 10, marginBottom: 10, borderRadius: 6, border: '1px solid #1F2B45', background: '#121B30', color: '#E8EDF5' }}
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          minLength={6}
          style={{ width: '100%', padding: 10, marginBottom: 10, borderRadius: 6, border: '1px solid #1F2B45', background: '#121B30', color: '#E8EDF5' }}
        />

        {error && <p style={{ color: '#E8674A', fontSize: 13, marginBottom: 10 }}>{error}</p>}
        {message && <p style={{ color: '#22D3EE', fontSize: 13, marginBottom: 10 }}>{message}</p>}

        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: 10, borderRadius: 6, background: '#22D3EE', color: '#04141A', fontWeight: 600, border: 'none', opacity: loading ? 0.6 : 1 }}
        >
          {loading ? 'Please wait...' : mode === 'signin' ? 'Sign in' : 'Sign up'}
        </button>

        <p style={{ color: '#7A8AA6', fontSize: 13, marginTop: 16, textAlign: 'center' }}>
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); setMessage('') }}
            style={{ background: 'none', border: 'none', color: '#22D3EE', cursor: 'pointer', padding: 0, font: 'inherit' }}
          >
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </form>
    </div>
  )
}