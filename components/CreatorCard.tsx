import Link from 'next/link'
import type { Creator } from '@/lib/types'

export default function CreatorCard({ creator }: { creator: Creator }) {
  const photo = creator.portfolio_photos?.[0]?.url
  const pkg = creator.packages?.[0]
  const minPrice = creator.packages && creator.packages.length > 0 ? creator.packages.reduce((min, p) => Math.min(min, p.price), Infinity) : undefined
  const maxPrice = creator.packages && creator.packages.length > 0 ? creator.packages.reduce((max, p) => Math.max(max, p.price), 0) : undefined

  return (
    <Link href={`/creators/${creator.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
      <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, overflow: 'hidden', transition: 'transform 0.2s, border-color 0.2s', cursor: 'pointer' }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.borderColor = '#444' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.borderColor = '#2a2a2a' }}>

        {/* Photo */}
        <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden', background: '#111' }}>
          {photo ? (
            <img src={photo} alt={creator.profiles?.full_name || 'Creator'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#444', fontSize: 48 }}>📷</div>
          )}
          <span style={{ position: 'absolute', top: 12, right: 12, background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', color: 'white', fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            Verified
          </span>
        </div>

        {/* Info */}
        <div style={{ padding: '14px 16px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span style={{ fontWeight: 600, fontSize: 15 }}>{creator.profiles?.full_name || 'Creator'}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              4.9
            </span>
          </div>
          <p style={{ color: '#9ca3af', fontSize: 13, marginBottom: 10 }}>{creator.specialty || 'Videographer'}</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#9ca3af', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              Travels {creator.travel_miles} mi
            </span>
            <span style={{ fontSize: 13, fontWeight: 600 }}>
              {minPrice !== undefined && minPrice !== Infinity ? `$${minPrice}${maxPrice && maxPrice > minPrice ? `–${maxPrice}` : ''}` : 'Contact for price'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
