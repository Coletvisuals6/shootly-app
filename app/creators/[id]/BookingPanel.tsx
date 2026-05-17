'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Creator, Package } from '@/lib/types'

interface Props {
  creator: Creator
  blockedDates: string[]
  userId: string | null
  userRole: string | null
}

export default function BookingPanel({ creator, blockedDates, userId, userRole }: Props) {
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(creator.packages?.[0] || null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageText, setMessageText] = useState('')
  const [tab, setTab] = useState<'packages' | 'message'>('packages')
  const supabase = createClient()

  const today = new Date()
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [viewYear, setViewYear] = useState(today.getFullYear())

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December']
  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  const isBlocked = (d: number) => {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
    return blockedDates.includes(dateStr)
  }

  const handleBook = async () => {
    if (!userId) { window.location.href = '/auth/signin'; return }
    if (!selectedPackage || !selectedDate) { setMessage('Please select a package and a date.'); return }
    setLoading(true)
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ packageId: selectedPackage.id, creatorId: creator.id, eventDate: selectedDate, notes }),
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else { setMessage(data.error || 'Something went wrong.'); setLoading(false) }
  }

  const handleMessage = async () => {
    if (!userId) { window.location.href = '/auth/signin'; return }
    if (!messageText.trim()) return
    setLoading(true)
    // Get or create conversation
    const { data: existing } = await supabase.from('conversations').select('id').eq('client_id', userId).eq('creator_id', creator.id).single()
    let convId = existing?.id
    if (!convId) {
      const { data: conv } = await supabase.from('conversations').insert({ client_id: userId, creator_id: creator.id }).select('id').single()
      convId = conv?.id
    }
    if (convId) {
      await supabase.from('messages').insert({ conversation_id: convId, sender_id: userId, content: messageText })
      setMessageText('')
      setMessage('Message sent!')
      setTimeout(() => { setMessage(''); window.location.href = '/dashboard/client/messages' }, 1500)
    }
    setLoading(false)
  }

  const inputStyle = { width: '100%', background: '#141414', border: '1px solid #2a2a2a', borderRadius: 8, padding: '10px 14px', color: '#fff', fontSize: 14, outline: 'none', fontFamily: 'inherit' }

  return (
    <aside>
      <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, padding: 24, position: 'sticky', top: 84 }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {(['packages', 'message'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ flex: 1, background: tab === t ? '#1f1535' : '#141414', border: `1px solid ${tab === t ? '#7c3aed' : '#2a2a2a'}`, color: tab === t ? '#a78bfa' : '#9ca3af', borderRadius: 8, padding: '9px', fontSize: 13, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize' }}>
              {t === 'packages' ? '📦 Packages' : '💬 Message'}
            </button>
          ))}
        </div>

        {tab === 'packages' ? (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Packages</h2>
            {creator.packages?.map((pkg: Package) => (
              <div key={pkg.id} onClick={() => setSelectedPackage(pkg)}
                style={{ border: `1px solid ${selectedPackage?.id === pkg.id ? '#7c3aed' : '#2a2a2a'}`, background: selectedPackage?.id === pkg.id ? '#1f1535' : 'transparent', borderRadius: 10, padding: 16, marginBottom: 12, cursor: 'pointer', transition: 'all 0.15s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{pkg.name}</span>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>${pkg.price}</span>
                </div>
                <p style={{ color: '#9ca3af', fontSize: 12, marginBottom: 8 }}>{pkg.description}</p>
                <ul style={{ listStyle: 'none', fontSize: 13, color: '#9ca3af', display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {pkg.features.map((f, i) => <li key={i}>✓ {f}</li>)}
                </ul>
              </div>
            ))}

            {/* Calendar */}
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Select Date</h3>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <button onClick={() => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) } else setViewMonth(m => m - 1) }} style={{ background: '#141414', border: '1px solid #2a2a2a', color: '#fff', width: 28, height: 28, borderRadius: 6, cursor: 'pointer', fontSize: 16 }}>‹</button>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{monthNames[viewMonth]} {viewYear}</span>
                <button onClick={() => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) } else setViewMonth(m => m + 1) }} style={{ background: '#141414', border: '1px solid #2a2a2a', color: '#fff', width: 28, height: 28, borderRadius: 6, cursor: 'pointer', fontSize: 16 }}>›</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3, textAlign: 'center', marginBottom: 6 }}>
                {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <span key={d} style={{ fontSize: 11, color: '#9ca3af', padding: '4px 0' }}>{d}</span>)}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3 }}>
                {Array(firstDay).fill(null).map((_, i) => <div key={`e${i}`} />)}
                {Array(daysInMonth).fill(null).map((_, i) => {
                  const d = i + 1
                  const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
                  const blocked = isBlocked(d)
                  const selected = selectedDate === dateStr
                  return (
                    <button key={d} disabled={blocked} onClick={() => setSelectedDate(dateStr)}
                      style={{ aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, fontSize: 12, border: `1px solid ${selected ? '#7c3aed' : 'transparent'}`, background: blocked ? '#3a1a1a' : selected ? '#2a1a4e' : '#141414', color: blocked ? '#c0504f' : '#fff', cursor: blocked ? 'not-allowed' : 'pointer' }}>
                      {d}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Notes */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, color: '#9ca3af', display: 'block', marginBottom: 6 }}>Notes (optional)</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Tell the creator about your event..." style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} />
            </div>

            {message && <p style={{ fontSize: 13, color: '#f87171', marginBottom: 12 }}>{message}</p>}
            <button onClick={handleBook} disabled={loading} style={{ width: '100%', background: 'linear-gradient(135deg,#ec4899,#8b5cf6)', color: 'white', border: 'none', borderRadius: 10, padding: 14, fontSize: 15, fontWeight: 600, cursor: 'pointer', marginBottom: 10, opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Processing...' : `Book Now${selectedPackage ? ` — $${selectedPackage.price}` : ''}`}
            </button>
            {!userId && <p style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center' }}>You&apos;ll need to sign in to book</p>}
          </>
        ) : (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Message {creator.profiles?.full_name}</h2>
            <textarea value={messageText} onChange={e => setMessageText(e.target.value)} placeholder={`Hi, I'm interested in booking you for...`} style={{ ...inputStyle, minHeight: 140, resize: 'vertical', marginBottom: 12 }} />
            {message && <p style={{ fontSize: 13, color: '#4ade80', marginBottom: 12 }}>{message}</p>}
            <button onClick={handleMessage} disabled={loading || !messageText.trim()} style={{ width: '100%', background: 'linear-gradient(135deg,#ec4899,#8b5cf6)', color: 'white', border: 'none', borderRadius: 10, padding: 14, fontSize: 15, fontWeight: 600, cursor: 'pointer', opacity: (loading || !messageText.trim()) ? 0.6 : 1 }}>
              {loading ? 'Sending...' : 'Send Message'}
            </button>
            {!userId && <p style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', marginTop: 8 }}>You&apos;ll need to <a href="/auth/signin" style={{ color: '#a78bfa' }}>sign in</a> to message</p>}
          </>
        )}

        {/* AI Recommendation */}
        <div style={{ background: '#1f1535', border: '1px solid #3b2a6e', borderRadius: 10, padding: 14, marginTop: 16 }}>
          <p style={{ fontSize: 11, color: '#a78bfa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>AI Recommendation</p>
          <p style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.5 }}>{creator.profiles?.full_name} is a great match with {creator.projects_completed}+ completed projects in {creator.specialty}.</p>
        </div>
      </div>
    </aside>
  )
}
