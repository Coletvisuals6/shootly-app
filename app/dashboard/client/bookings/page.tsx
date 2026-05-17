'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/client'

export default function ClientBookings() {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/signin'); return }
      const { data } = await supabase.from('bookings').select('*, creators(*, profiles(*)), packages(*)').eq('client_id', user.id).order('created_at', { ascending: false })
      setBookings(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const statusColor = (s: string) => s === 'confirmed' ? { bg: '#1a2e1a', text: '#4ade80' } : s === 'pending' ? { bg: '#2a2000', text: '#f59e0b' } : s === 'cancelled' ? { bg: '#2a1a1a', text: '#f87171' } : { bg: '#1a1a2e', text: '#60a5fa' }

  return (
    <div>
      <Navbar />
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>My Bookings</h1>
          <Link href="/creators" style={{ background: 'linear-gradient(135deg,#ec4899,#8b5cf6)', color: '#fff', textDecoration: 'none', borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 600 }}>Find Creators</Link>
        </div>
        {loading ? <p style={{ color: '#9ca3af' }}>Loading...</p> : bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12 }}>
            <p style={{ fontSize: 40, marginBottom: 16 }}>🎬</p>
            <p style={{ color: '#9ca3af', fontSize: 15, marginBottom: 20 }}>No bookings yet. Find a creator to get started!</p>
            <Link href="/creators" style={{ background: 'linear-gradient(135deg,#ec4899,#8b5cf6)', color: '#fff', textDecoration: 'none', borderRadius: 8, padding: '12px 24px', fontSize: 14, fontWeight: 600 }}>Browse Creators</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {bookings.map(b => {
              const sc = statusColor(b.status)
              return (
                <div key={b.id} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, padding: '20px 24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <Link href={`/creators/${b.creator_id}`} style={{ fontWeight: 700, fontSize: 16, marginBottom: 2, color: '#fff', textDecoration: 'none' }}>{b.creators?.profiles?.full_name}</Link>
                      <p style={{ color: '#9ca3af', fontSize: 13, marginTop: 2 }}>{b.packages?.name} · {b.event_date || 'No date'}</p>
                      {b.notes && <p style={{ color: '#9ca3af', fontSize: 13, marginTop: 6, fontStyle: 'italic' }}>"{b.notes}"</p>}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>${b.amount}</p>
                      <span style={{ background: sc.bg, color: sc.text, padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{b.status}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
