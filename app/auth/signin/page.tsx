'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      if (profile?.role === 'admin') window.location.href = '/dashboard/admin'
      else if (profile?.role === 'creator') window.location.href = '/dashboard/creator'
      else window.location.href = '/dashboard/client'
    }
  }

  const inputStyle = { width: '100%', background: '#141414', border: '1px solid #2a2a2a', borderRadius: 8, padding: '12px 14px', color: '#fff', fontSize: 14, outline: 'none', fontFamily: 'inherit' }
  const labelStyle = { fontSize: 13, fontWeight: 500, color: '#9ca3af', display: 'block', marginBottom: 6 }

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d0d', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#f0abfc,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: 20, color: '#fff' }}>Shootly</span>
          </Link>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Welcome back</h1>
          <p style={{ color: '#9ca3af', fontSize: 14 }}>Sign in to your account</p>
        </div>

        <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 16, padding: 32 }}>
          <form onSubmit={handleSignIn}>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required style={inputStyle} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required style={inputStyle} />
            </div>
            {error && <p style={{ color: '#f87171', fontSize: 13, marginBottom: 16, background: '#2a0a0a', padding: '10px 14px', borderRadius: 8 }}>{error}</p>}
            <button type="submit" disabled={loading} style={{ width: '100%', background: 'linear-gradient(135deg,#ec4899,#8b5cf6)', color: 'white', border: 'none', borderRadius: 10, padding: 14, fontSize: 15, fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#9ca3af' }}>
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" style={{ color: '#a78bfa', textDecoration: 'none' }}>Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
