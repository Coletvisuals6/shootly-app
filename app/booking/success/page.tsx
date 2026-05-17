import Link from 'next/link'

export default function BookingSuccess() {
  return (
    <div style={{ minHeight: '100vh', background: '#0d0d0d', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <div style={{ width: 80, height: 80, background: '#1a2e1a', border: '1px solid #2d5a2d', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>Booking Confirmed!</h1>
        <p style={{ color: '#9ca3af', fontSize: 16, marginBottom: 32, lineHeight: 1.6 }}>
          Your payment was successful and your booking request has been sent to the creator. They will confirm your booking shortly.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Link href="/dashboard/client/bookings" style={{ background: 'linear-gradient(135deg,#ec4899,#8b5cf6)', color: '#fff', textDecoration: 'none', borderRadius: 10, padding: '12px 24px', fontWeight: 600, fontSize: 15 }}>View My Bookings</Link>
          <Link href="/creators" style={{ background: 'transparent', border: '1px solid #2a2a2a', color: '#fff', textDecoration: 'none', borderRadius: 10, padding: '12px 24px', fontSize: 15 }}>Browse More Creators</Link>
        </div>
      </div>
    </div>
  )
}
