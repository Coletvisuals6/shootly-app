'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types'

export default function Navbar() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const getProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
          setProfile(data)
        }
      } catch (e) {
        // ignore errors, just show signed-out state
      } finally {
        setLoading(false)
      }
    }
    getProfile()
    const { data: listener } = supabase.auth.onAuthStateChange(() => getProfile())
    return () => listener.subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const dashboardHref = profile?.role === 'admin'
    ? '/dashboard/admin'
    : profile?.role === 'creator'
    ? '/dashboard/creator'
    : '/dashboard/client'

  return (
    <nav style={{ background: 'rgba(13,13,13,0.95)', borderBottom: '1px solid #2a2a2a', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(12px)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #f0abfc, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: 18, color: '#fff' }}>Shootly</span>
          </Link>
          <Link href="/creators" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>Find Creators</Link>
          <Link href="/for-creators" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>For Creators</Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {loading ? null : profile ? (
            <>
              <Link href={dashboardHref} style={{ color: '#a78bfa', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>
                Dashboard
              </Link>
              <span style={{ color: '#9ca3af', fontSize: 14 }}>{profile.full_name || profile.email}</span>
              <button onClick={signOut} style={{ background: 'transparent', border: '1px solid #2a2a2a', color: '#9ca3af', borderRadius: 8, padding: '8px 14px', fontSize: 13, cursor: 'pointer' }}>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/signin" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: 14 }}>Sign In</Link>
              <Link href="/auth/signup?role=creator" style={{ background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', color: 'white', textDecoration: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 14, fontWeight: 600 }}>
                Join as Creator
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
