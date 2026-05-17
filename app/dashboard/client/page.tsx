import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/server'

export default async function ClientDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/signin')
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const { data: bookings } = await supabase.from('bookings').select('status, amount').eq('client_id', user.id)
  const { data: convs } = await supabase.from('conversations').select('id, messages(read, sender_id)').eq('client_id', user.id)

  const unread = convs?.reduce((s: number, c: any) => s + (c.messages?.filter((m: any) => !m.read && m.sender_id !== user.id).length || 0), 0) || 0
  const active = bookings?.filter((b: any) => b.status === 'confirmed').length || 0

  return (
    <div>
      <Navbar />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Welcome back, {profile?.full_name} 👋</h1>
        <p style={{ color: '#9ca3af', marginBottom: 40 }}>Manage your bookings and messages</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 40 }}>
          {[
            { label: 'Total Bookings', value: bookings?.length || 0, icon: '📅' },
            { label: 'Active Bookings', value: active, icon: '✅' },
            { label: 'Unread Messages', value: unread, icon: '💬' },
          ].map(s => (
            <div key={s.label} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, padding: '20px 24px' }}>
              <p style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</p>
              <p style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>{s.value}</p>
              <p style={{ color: '#9ca3af', fontSize: 13 }}>{s.label}</p>
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          <Link href="/creators" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, padding: '24px', textDecoration: 'none', color: '#fff' }}>
            <p style={{ fontSize: 24, marginBottom: 10 }}>🔍</p>
            <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Find Creators</p>
            <p style={{ color: '#9ca3af', fontSize: 13 }}>Browse and book videographers</p>
          </Link>
          <Link href="/dashboard/client/bookings" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, padding: '24px', textDecoration: 'none', color: '#fff' }}>
            <p style={{ fontSize: 24, marginBottom: 10 }}>📅</p>
            <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>My Bookings</p>
            <p style={{ color: '#9ca3af', fontSize: 13 }}>View and track your bookings</p>
          </Link>
          <Link href="/dashboard/client/messages" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, padding: '24px', textDecoration: 'none', color: '#fff' }}>
            <p style={{ fontSize: 24, marginBottom: 10 }}>💬</p>
            <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Messages {unread > 0 && `(${unread})`}</p>
            <p style={{ color: '#9ca3af', fontSize: 13 }}>Chat with your creators</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
