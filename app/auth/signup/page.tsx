'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignUp() {
  const [step, setStep] = useState<'role' | 'form'>('role')
  const [role, setRole] = useState<'client' | 'creator'>('client')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [location, setLocation] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const supabase = createClient()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role, specialty, location },
        emailRedirectTo: `${location || window.location.origin}/auth/callback`,
      },
    })
    if (error) { setError(error.message); setLoading(false); return }
    setDone(true)
  }

  const inputStyle = { width: '100%', background: '#141414', border: '1px solid #2a2a2a', borderRadius: 8, padding: '12px 14px', color: '#fff', fontSize: 14, outline: 'none', fontFamily: 'inherit' }
  const labelStyle = { fontSize: 13, fontWeight: 500, color: '#9ca3af', display: 'block', marginBottom: 6 }

  if (done) return (
    <div style={{ minHeight: '100vh', background: '#0d0d0d', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 420 }}>
        <div style={{ width: 64, height: 64, background: '#1a2e1a', border: '1px solid #2d5a2d', borderRadius: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 10 }}>Check your email</h2>
        <p style={{ color: '#9ca3af', fontSize: 15, marginBottom: 24 }}>
          We sent a confirmation link to <strong style={{ color: '#fff' }}>{email}</strong>. Click it to activate your account.
          {role === 'creator' && <><br /><br />Your creator profile will be reviewed by our team before going live.</>}
        </p>
        <Link href="/" style={{ color: '#a78bfa', textDecoration: 'none', fontSize: 14 }}>← Back to homepage</Link>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d0d', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#f0abfc,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: 20, color: '#fff' }}>Shootly</span>
          </Link>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Create your account</h1>
        </div>

        <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 16, padding: 32 }}>
          {step === 'role' ? (
            <div>
              <p style={{ color: '#9ca3af', fontSize: 14, marginBottom: 20, textAlign: 'center' }}>I want to...</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                {[
                  { value: 'client', label: 'Book a videographer', desc: 'Find and hire creators for my project', icon: '🎬' },
                  { value: 'creator', label: 'Offer my services', desc: 'List my videography packages and get booked', icon: '📷' },
                ].map(opt => (
                  <button key={opt.value} onClick={() => setRole(opt.value as 'client' | 'creator')}
                    style={{ background: role === opt.value ? '#1f1535' : '#141414', border: `2px solid ${role === opt.value ? '#7c3aed' : '#2a2a2a'}`, borderRadius: 10, padding: '16px 20px', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 14, transition: 'all 0.15s' }}>
                    <span style={{ fontSize: 24 }}>{opt.icon}</span>
                    <div>
                      <p style={{ color: '#fff', fontWeight: 600, fontSize: 15, marginBottom: 2 }}>{opt.label}</p>
                      <p style={{ color: '#9ca3af', fontSize: 13 }}>{opt.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
              <button onClick={() => setStep('form')} style={{ width: '100%', background: 'linear-gradient(135deg,#ec4899,#8b5cf6)', color: 'white', border: 'none', borderRadius: 10, padding: 14, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
                Continue
              </button>
            </div>
          ) : (
            <form onSubmit={handleSignUp}>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Full Name</label>
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your name" required style={inputStyle} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required style={inputStyle} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 8 characters" minLength={8} required style={inputStyle} />
              </div>
              {role === 'creator' && (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>Specialty (e.g. Wedding Videographer)</label>
                    <input type="text" value={specialty} onChange={e => setSpecialty(e.target.value)} placeholder="Sports Videographer" required style={inputStyle} />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>Your City</label>
                    <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="Los Angeles, CA" required style={inputStyle} />
                  </div>
                </>
              )}
              {error && <p style={{ color: '#f87171', fontSize: 13, marginBottom: 16, background: '#2a0a0a', padding: '10px 14px', borderRadius: 8 }}>{error}</p>}
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => setStep('role')} style={{ flex: 1, background: '#141414', border: '1px solid #2a2a2a', color: '#fff', borderRadius: 10, padding: 13, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                  Back
                </button>
                <button type="submit" disabled={loading} style={{ flex: 2, background: 'linear-gradient(135deg,#ec4899,#8b5cf6)', color: 'white', border: 'none', borderRadius: 10, padding: 13, fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
              </div>
            </form>
          )}
          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#9ca3af' }}>
            Already have an account?{' '}
            <Link href="/auth/signin" style={{ color: '#a78bfa', textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
