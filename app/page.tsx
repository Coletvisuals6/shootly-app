import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import CreatorCard from '@/components/CreatorCard'
import type { Creator } from '@/lib/types'

export default async function Home({ searchParams }: { searchParams: Promise<{ location?: string; specialty?: string }> }) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('creators')
    .select(`*, profiles(*), portfolio_photos(*), packages(*), creator_specialties(*)`)
    .eq('status', 'approved')
    .order('projects_completed', { ascending: false })
    .limit(6)

  if (params.specialty) query = query.ilike('specialty', `%${params.specialty}%`)
  if (params.location) query = query.ilike('location', `%${params.location}%`)

  const { data: creators } = await query

  return (
    <div>
      <Navbar />

      {/* Hero */}
      <section style={{ position: 'relative', textAlign: 'center', padding: '120px 24px 100px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', filter: 'blur(120px)', opacity: 0.15, background: '#7c3aed', top: -100, left: -100, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', filter: 'blur(120px)', opacity: 0.15, background: '#ec4899', top: -100, right: -100, pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto' }}>
          <h1 style={{ fontSize: 'clamp(36px,5.5vw,72px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: -1.5, marginBottom: 20 }}>
            Find and book top videographers<br />&amp; photographers instantly
          </h1>
          <p style={{ color: '#9ca3af', fontSize: 17, marginBottom: 44 }}>Transparent pricing. Real portfolios. No back-and-forth messaging.</p>

          {/* Search */}
          <form method="GET" action="/" style={{ display: 'flex', alignItems: 'center', background: '#1c1c1c', border: '1px solid #333', borderRadius: 14, maxWidth: 780, margin: '0 auto', overflow: 'hidden', padding: 6, gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', flex: 1, padding: '10px 16px', gap: 10 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <input name="location" defaultValue={params.location} placeholder="Location" style={{ background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: 15, width: '100%', fontFamily: 'inherit' }} />
            </div>
            <div style={{ width: 1, height: 36, background: '#333', flexShrink: 0 }} />
            <div style={{ display: 'flex', alignItems: 'center', flex: 1, padding: '10px 16px', gap: 10 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
              <input name="specialty" defaultValue={params.specialty} placeholder="Sports videographer" style={{ background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: 15, width: '100%', fontFamily: 'inherit' }} />
            </div>
            <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,#ec4899,#8b5cf6)', color: 'white', border: 'none', borderRadius: 10, padding: '12px 24px', fontSize: 15, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Featured Creators */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 72px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 36, fontWeight: 700, marginBottom: 10 }}>Featured Creators</h2>
          <p style={{ color: '#9ca3af', fontSize: 16 }}>Top-rated professionals ready for your next project</p>
        </div>
        {creators && creators.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 40 }}>
            {creators.map((c: Creator) => <CreatorCard key={c.id} creator={c} />)}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 24px', color: '#9ca3af' }}>
            {params.specialty || params.location ? (
              <>
                <p style={{ fontSize: 16, marginBottom: 16 }}>No creators found. Try a different search.</p>
                <Link href="/" style={{ color: '#a78bfa', textDecoration: 'none', fontSize: 14 }}>Clear search</Link>
              </>
            ) : (
              <p style={{ fontSize: 16 }}>No creators yet — be the first to <Link href="/auth/signup" style={{ color: '#a78bfa', textDecoration: 'none' }}>join</Link>!</p>
            )}
          </div>
        )}
        <div style={{ textAlign: 'center' }}>
          <Link href="/creators" style={{ background: 'transparent', color: '#fff', border: '1px solid #2a2a2a', borderRadius: 10, padding: '12px 28px', fontSize: 14, fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>
            View All Creators
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '72px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 36, fontWeight: 700, marginBottom: 10 }}>How It Works</h2>
          <p style={{ color: '#9ca3af', fontSize: 16 }}>Book your perfect creator in three simple steps</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 40, textAlign: 'center' }}>
          {[
            { icon: '🔍', bg: '#3b1f6b', title: 'Search', desc: 'Browse portfolios and filter by location, specialty, and budget' },
            { icon: '⭐', bg: '#5a1a3a', title: 'Compare', desc: 'Review ratings, packages, and transparent pricing upfront' },
            { icon: '📅', bg: '#2d1a5e', title: 'Book', desc: 'Secure your date and pay safely through our platform' },
          ].map(step => (
            <div key={step.title}>
              <div style={{ width: 72, height: 72, borderRadius: 18, background: step.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 28 }}>{step.icon}</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>{step.title}</h3>
              <p style={{ color: '#9ca3af', fontSize: 14, maxWidth: 220, margin: '0 auto' }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust */}
      <section style={{ background: '#141414', borderTop: '1px solid #2a2a2a', borderBottom: '1px solid #2a2a2a', padding: '72px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 40, textAlign: 'center', maxWidth: 900, margin: '0 auto' }}>
          {[
            { icon: '🛡️', title: 'Verified Creators', desc: 'All creators are background-checked and portfolio-verified' },
            { icon: '⭐', title: 'Real Reviews', desc: 'Read authentic feedback from verified bookings' },
            { icon: '💳', title: 'Transparent Pricing', desc: 'See all costs upfront with no hidden fees' },
          ].map(item => (
            <div key={item.title}>
              <div style={{ fontSize: 36, marginBottom: 16 }}>{item.icon}</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{item.title}</h3>
              <p style={{ color: '#9ca3af', fontSize: 14 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '32px 40px', borderTop: '1px solid #2a2a2a' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: 'linear-gradient(135deg,#f0abfc,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: 16, color: '#fff' }}>Shootly</span>
          </Link>
          <p style={{ color: '#9ca3af', fontSize: 13 }}>© 2026 Shootly. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
