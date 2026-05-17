import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/server'

export default async function CreatorDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/signin')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (profile?.role !== 'creator') redirect('/')

  const { data: creator } = await supabase.from('creators').select('*, packages(*), portfolio_photos(*)').eq('id', user.id).single()
  const { data: bookings } = await supabase.from('bookings').select('*, profiles(*), packages(*)').eq('creator_id', user.id).order('created_at', { ascending: false }).limit(5)
  const { data: messages } = await supabase.from('conversations').select('*, messages(*)').eq('creator_id', user.id)

  const unreadMessages = messages?.reduce((sum: number, c: { messages?: { read: boolean; sender_id: string }[] }) =>
    sum + (c.messages?.filter(m => !m.read && m.sender_id !== user.id).length || 0), 0) || 0

  const pending = bookings?.filter((b: { status: string }) => b.status === 'pending').length || 0
  const earnings = bookings?.filter((b: { status: string; amount: number | null }) => b.status === 'confirmed' || b.status === 'completed').reduce((s: number, b: { amount: number | null }) => s + (b.amount || 0), 0) || 0

  const statusColor = creator?.status === 'approved' ? '#4ade80' : creator?.status === 'rejected' ? '#f87171' : '#f59e0b'
  const statusText = creator?.status === 'approved' ? 'Active' : creator?.status === 'rejected' ? 'Rejected' : 'Pending Approval'

  const linkStyle = { background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, padding: '20px 24px', textDecoration: 'none', color: '#fff', display: 'block', transition: 'border-color 0.2s' }

  return (
    <div>
      <Navbar />
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>Welcome back, {profile?.full_name} 👋</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor, display: 'inline-block' }} />
              <span style={{ color: statusColor, fontSize: 14, fontWeight: 500 }}>{statusText}</span>
              {creator?.status === 'pending' && <span style={{ color: '#9ca3af', fontSize: 13 }}>— Your profile is being reviewed</span>}
            </div>
          </div>
          <Link href={`/creators/${user.id}`} style={{ background: 'transparent', border: '1px solid #2a2a2a', color: '#9ca3af', borderRadius: 8, padding: '9px 16px', fontSize: 13, textDecoration: 'none' }}>
            View Public Profile →
          </Link>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 40 }}>
          {[
            { label: 'Packages', value: creator?.packages?.length || 0, icon: '📦' },
            { label: 'Pending Bookings', value: pending, icon: '📅' },
            { label: 'Unread Messages', value: unreadMessages, icon: '💬' },
            { label: 'Total Earnings', value: `$${earnings.toFixed(0)}`, icon: '💰' },
          ].map(stat => (
            <div key={stat.label} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, padding: '20px 24px' }}>
              <p style={{ fontSize: 24, marginBottom: 8 }}>{stat.icon}</p>
              <p style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>{stat.value}</p>
              <p style={{ color: '#9ca3af', fontSize: 13 }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16, marginBottom: 40 }}>
          {[
            { href: '/dashboard/creator/profile', icon: '👤', title: 'Edit Profile', desc: 'Update your bio, location, specialty, and photos' },
            { href: '/dashboard/creator/packages', icon: '📦', title: 'Manage Packages', desc: 'Add or edit your service packages and pricing' },
            { href: '/dashboard/creator/availability', icon: '📅', title: 'Set Availability', desc: "Block dates when you're not available" },
            { href: '/dashboard/creator/bookings', icon: '✅', title: 'Bookings', desc: 'View and manage all your booking requests' },
            { href: '/dashboard/creator/messages', icon: '💬', title: 'Messages', desc: `${unreadMessages > 0 ? `${unreadMessages} unread — ` : ''}Chat with your clients` },
          ].map(link => (
            <Link key={link.href} href={link.href} style={linkStyle}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = '#444'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = '#2a2a2a'}>
              <p style={{ fontSize: 22, marginBottom: 8 }}>{link.icon}</p>
              <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{link.title}</p>
              <p style={{ color: '#9ca3af', fontSize: 13 }}>{link.desc}</p>
            </Link>
          ))}
        </div>

        {/* Recent bookings */}
        {bookings && bookings.length > 0 && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Recent Bookings</h2>
            <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, overflow: 'hidden' }}>
              {bookings.map((b: { id: string; profiles?: { full_name?: string; email?: string }; packages?: { name?: string }; event_date?: string; status: string; amount?: number }, i: number) => (
                <div key={b.id} style={{ padding: '16px 24px', borderBottom: i < bookings.length - 1 ? '1px solid #2a2a2a' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{b.profiles?.full_name || b.profiles?.email}</p>
                    <p style={{ color: '#9ca3af', fontSize: 13 }}>{b.packages?.name} · {b.event_date || 'No date'}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>${b.amount || 0}</span>
                    <span style={{ background: b.status === 'confirmed' ? '#1a2e1a' : b.status === 'pending' ? '#2a2000' : '#2a1a1a', color: b.status === 'confirmed' ? '#4ade80' : b.status === 'pending' ? '#f59e0b' : '#f87171', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                      {b.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
