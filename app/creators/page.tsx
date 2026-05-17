import Navbar from '@/components/Navbar'
import CreatorCard from '@/components/CreatorCard'
import { createClient } from '@/lib/supabase/server'
import type { Creator } from '@/lib/types'

export default async function Creators({ searchParams }: { searchParams: Promise<{ location?: string; specialty?: string }> }) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('creators')
    .select('*, profiles(*), portfolio_photos(*), packages(*), creator_specialties(*)')
    .eq('status', 'approved')
    .order('projects_completed', { ascending: false })

  if (params.specialty) query = query.ilike('specialty', `%${params.specialty}%`)
  if (params.location) query = query.ilike('location', `%${params.location}%`)

  const { data: creators } = await query

  return (
    <div>
      <Navbar />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 36, fontWeight: 700, marginBottom: 10 }}>All Creators</h1>
          <p style={{ color: '#9ca3af' }}>Browse all verified videographers and photographers</p>
        </div>

        {/* Filters */}
        <form method="GET" style={{ display: 'flex', gap: 12, marginBottom: 40, flexWrap: 'wrap' }}>
          <input name="location" defaultValue={params.location} placeholder="Filter by city..." style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, padding: '10px 14px', color: '#fff', fontSize: 14, outline: 'none', fontFamily: 'inherit', minWidth: 200 }} />
          <input name="specialty" defaultValue={params.specialty} placeholder="Filter by specialty..." style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, padding: '10px 14px', color: '#fff', fontSize: 14, outline: 'none', fontFamily: 'inherit', minWidth: 200 }} />
          <button type="submit" style={{ background: 'linear-gradient(135deg,#ec4899,#8b5cf6)', color: 'white', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Search</button>
          {(params.location || params.specialty) && (
            <a href="/creators" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#9ca3af', borderRadius: 8, padding: '10px 16px', fontSize: 14, textDecoration: 'none', display: 'flex', alignItems: 'center' }}>Clear</a>
          )}
        </form>

        {creators && creators.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {creators.map((c: Creator) => <CreatorCard key={c.id} creator={c} />)}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 24px', color: '#9ca3af' }}>
            <p style={{ fontSize: 16 }}>No creators found. Try adjusting your search.</p>
          </div>
        )}
      </div>
    </div>
  )
}
