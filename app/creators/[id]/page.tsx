import { notFound } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import BookingPanel from './BookingPanel'
import { createClient } from '@/lib/supabase/server'

export default async function CreatorProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: creator } = await supabase
    .from('creators')
    .select('*, profiles(*), portfolio_photos(*), packages(*), creator_specialties(*), creator_equipment(*)')
    .eq('id', id)
    .eq('status', 'approved')
    .single()

  if (!creator) notFound()

  const { data: blockedDates } = await supabase
    .from('blocked_dates')
    .select('blocked_date')
    .eq('creator_id', id)

  const { data: { user } } = await supabase.auth.getUser()
  const { data: userProfile } = user
    ? await supabase.from('profiles').select('role').eq('id', user.id).single()
    : { data: null }

  const photos = creator.portfolio_photos?.sort((a: { position: number }, b: { position: number }) => a.position - b.position) || []

  return (
    <div>
      <Navbar />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px 72px' }}>
        <Link href="/creators" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#9ca3af', textDecoration: 'none', fontSize: 14, marginBottom: 24 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Back to search
        </Link>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 28, alignItems: 'start' }}>
          {/* Left */}
          <div>
            {/* Gallery */}
            {photos.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ borderRadius: 12, overflow: 'hidden', aspectRatio: '16/9', marginBottom: 8 }}>
                  <img src={photos[0].url} alt="Main photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                {photos.length > 1 && (
                  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(photos.length - 1, 3)}, 1fr)`, gap: 8 }}>
                    {photos.slice(1, 4).map((p: { id: string; url: string }) => (
                      <img key={p.id} src={p.url} alt="Portfolio" style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', borderRadius: 8 }} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Info card */}
            <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, padding: 24, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <h1 style={{ fontSize: 26, fontWeight: 700 }}>{creator.profiles?.full_name}</h1>
                    <div style={{ width: 24, height: 24, background: '#7c3aed', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                  </div>
                  <p style={{ color: '#9ca3af', marginBottom: 12 }}>{creator.specialty}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: 13, color: '#9ca3af' }}>
                    <span>📍 {creator.location} · Travels up to {creator.travel_miles} mi</span>
                    <span>⏱ Responds {creator.response_time}</span>
                    <span>🎬 {creator.projects_completed} projects completed</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  <span style={{ fontSize: 22, fontWeight: 700 }}>4.9</span>
                  <span style={{ color: '#9ca3af', fontSize: 13 }}>(reviews)</span>
                </div>
              </div>

              {creator.bio && (
                <div style={{ marginBottom: 20 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 10 }}>About</h2>
                  <p style={{ color: '#9ca3af', fontSize: 14, lineHeight: 1.7 }}>{creator.bio}</p>
                </div>
              )}

              {creator.creator_specialties?.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 10 }}>Specialties</h2>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {creator.creator_specialties.map((s: { id: string; name: string }) => (
                      <span key={s.id} style={{ background: '#1f1535', color: '#a78bfa', border: '1px solid #3b2a6e', borderRadius: 6, padding: '5px 12px', fontSize: 13 }}>{s.name}</span>
                    ))}
                  </div>
                </div>
              )}

              {creator.creator_equipment?.length > 0 && (
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 10 }}>Equipment</h2>
                  <ul style={{ listStyle: 'none', color: '#9ca3af', fontSize: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {creator.creator_equipment.map((e: { id: string; name: string }) => (
                      <li key={e.id}>• {e.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Right: Booking panel */}
          <BookingPanel
            creator={creator}
            blockedDates={blockedDates?.map((d: { blocked_date: string }) => d.blocked_date) || []}
            userId={user?.id || null}
            userRole={userProfile?.role || null}
          />
        </div>
      </div>
    </div>
  )
}
