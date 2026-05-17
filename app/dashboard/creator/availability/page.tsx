'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/client'

export default function Availability() {
  const [blocked, setBlocked] = useState<string[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [viewMonth, setViewMonth] = useState(new Date().getMonth())
  const [viewYear, setViewYear] = useState(new Date().getFullYear())
  const [saving, setSaving] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December']
  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/signin'); return }
      setUserId(user.id)
      const { data } = await supabase.from('blocked_dates').select('blocked_date').eq('creator_id', user.id)
      setBlocked(data?.map((d: { blocked_date: string }) => d.blocked_date) || [])
    }
    load()
  }, [])

  const toggleDate = async (d: number) => {
    if (!userId) return
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
    setSaving(dateStr)
    if (blocked.includes(dateStr)) {
      await supabase.from('blocked_dates').delete().eq('creator_id', userId).eq('blocked_date', dateStr)
      setBlocked(prev => prev.filter(x => x !== dateStr))
    } else {
      await supabase.from('blocked_dates').insert({ creator_id: userId, blocked_date: dateStr })
      setBlocked(prev => [...prev, dateStr])
    }
    setSaving(null)
  }

  return (
    <div>
      <Navbar />
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Availability</h1>
            <p style={{ color: '#9ca3af', fontSize: 14 }}>Click a date to block or unblock it</p>
          </div>
          <button onClick={() => router.push('/dashboard/creator')} style={{ background: 'transparent', border: '1px solid #2a2a2a', color: '#9ca3af', borderRadius: 8, padding: '8px 14px', fontSize: 13, cursor: 'pointer' }}>← Dashboard</button>
        </div>

        <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, padding: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <button onClick={() => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) } else setViewMonth(m => m - 1) }} style={{ background: '#141414', border: '1px solid #2a2a2a', color: '#fff', width: 36, height: 36, borderRadius: 8, cursor: 'pointer', fontSize: 20 }}>‹</button>
            <span style={{ fontSize: 18, fontWeight: 700 }}>{monthNames[viewMonth]} {viewYear}</span>
            <button onClick={() => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) } else setViewMonth(m => m + 1) }} style={{ background: '#141414', border: '1px solid #2a2a2a', color: '#fff', width: 36, height: 36, borderRadius: 8, cursor: 'pointer', fontSize: 20 }}>›</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, marginBottom: 12, textAlign: 'center' }}>
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <span key={d} style={{ fontSize: 12, color: '#9ca3af', padding: '6px 0' }}>{d}</span>)}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
            {Array(firstDay).fill(null).map((_, i) => <div key={`e${i}`} />)}
            {Array(daysInMonth).fill(null).map((_, i) => {
              const d = i + 1
              const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
              const isBlocked = blocked.includes(dateStr)
              const isSaving = saving === dateStr
              return (
                <button key={d} onClick={() => toggleDate(d)} disabled={!!isSaving}
                  style={{ aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, fontSize: 14, border: 'none', background: isBlocked ? '#3a1a1a' : '#141414', color: isBlocked ? '#f87171' : '#fff', cursor: isSaving ? 'wait' : 'pointer', transition: 'all 0.15s', fontWeight: isBlocked ? 600 : 400 }}>
                  {d}
                </button>
              )
            })}
          </div>

          <div style={{ display: 'flex', gap: 20, marginTop: 20, fontSize: 13, color: '#9ca3af' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: '#141414', border: '1px solid #333', display: 'inline-block' }} /> Available</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: '#3a1a1a', border: '1px solid #5a2020', display: 'inline-block' }} /> Blocked</span>
          </div>
        </div>

        <p style={{ color: '#9ca3af', fontSize: 13, textAlign: 'center', marginTop: 16 }}>
          Blocked dates ({blocked.length} total) — Clients cannot select these dates when booking
        </p>
      </div>
    </div>
  )
}
