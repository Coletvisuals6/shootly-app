'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/client'
import type { Booking } from '@/lib/types'

export default function CreatorBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/signin'); return }
      setUserId(user.id)
      const { data } = await supabase.from('bookings').select('*, profiles(*), packages(*)').eq('creator_id', user.id).order('created_at', { ascending: false })
      setBookings(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('bookings').update({ status }).eq('id', id)
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: status as Booking['status'] } : b))
  }

  const statusColor = (s: string) => s === 'confirmed' ? { bg: '#1a2e1a', text: '#4ade80' } : s === 'pending' ? { bg: '#2a2000', text: '#f59e0b' } : s === 'cancelled' ? { bg: '#2a1a1a', text: '#f87171' } : { bg: '#1a1a2e', text: '#60a5fa' }

  return (
    <div>
      <Navbar />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Bookings</h1>
          <button onClick={() => router.push('/dashboard/creator')} style={{ background: 'transparent', border: '1px solid #2a2a2a', color: '#9ca3af', borderRadius: 8, padding: '8px 14px', fontSize: 13, cursor: 'pointer' }}>← Dashboard</button>
        </div>

        {loading ? <p style={{ color: '#9ca3af' }}>Loading...</p> : bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12 }}>
            <p style={{ fontSize: 40, marginBottom: 16 }}>📅</p>
            <p style={{ color: '#9ca3af', fontSize: 15 }}>No bookings yet. Make sure your profile and packages are set up!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {bookings.map(b => {
              const sc = statusColor(b.status)
              return (
                <div key={b.id} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, padding: '20px 24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 2 }}>{(b as any).profiles?.full_name || (b as any).profiles?.email}</p>
                      <p style={{ color: '#9ca3af', fontSize: 13 }}>{(b as any).packages?.name} · {b.event_date || 'No date'}</p>
                      {b.notes && <p style={{ color: '#9ca3af', fontSize: 13, marginTop: 6, fontStyle: 'italic' }}>"{b.notes}"</p>}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: 18 }}>${b.amount}</span>
                      <span style={{ background: sc.bg, color: sc.text, padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{b.status}</span>
                    </div>
                  </div>
                  {b.status === 'pending' && (
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button onClick={() => updateStatus(b.id, 'confirmed')} style={{ flex: 1, background: '#1a2e1a', border: '1px solid #2d5a2d', color: '#4ade80', borderRadius: 8, padding: '10px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>✓ Confirm Booking</button>
                      <button onClick={() => updateStatus(b.id, 'cancelled')} style={{ flex: 1, background: '#2a1a1a', border: '1px solid #5a2020', color: '#f87171', borderRadius: 8, padding: '10px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>✗ Decline</button>
                    </div>
                  )}
                  {b.status === 'confirmed' && (
                    <button onClick={() => updateStatus(b.id, 'completed')} style={{ background: '#1a1a2e', border: '1px solid #2d2d5a', color: '#60a5fa', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Mark Completed</button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
