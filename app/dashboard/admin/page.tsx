import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/server'
import AdminActions from './AdminActions'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/signin')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/')

  const { data: pending } = await supabase.from('creators').select('*, profiles(*)').eq('status', 'pending').order('created_at', { ascending: true })
  const { data: approved } = await supabase.from('creators').select('*, profiles(*)').eq('status', 'approved').order('created_at', { ascending: false })
  const { data: allBookings } = await supabase.from('bookings').select('amount, status')

  const totalRevenue = allBookings?.filter((b: { status: string }) => b.status === 'confirmed' || b.status === 'completed').reduce((s: number, b: { amount: number | null }) => s + (b.amount || 0), 0) || 0

  return (
    <div>
      <Navbar />
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '48px 24px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Admin Dashboard</h1>
        <p style={{ color: '#9ca3af', marginBottom: 40 }}>Manage creator applications and platform activity</p>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 48 }}>
          {[
            { label: 'Pending Applications', value: pending?.length || 0, icon: '⏳', color: '#f59e0b' },
            { label: 'Active Creators', value: approved?.length || 0, icon: '✅', color: '#4ade80' },
            { label: 'Total Bookings', value: allBookings?.length || 0, icon: '📅', color: '#60a5fa' },
            { label: 'Platform Revenue', value: `$${totalRevenue.toFixed(0)}`, icon: '💰', color: '#a78bfa' },
          ].map(s => (
            <div key={s.label} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, padding: '20px 24px' }}>
              <p style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: s.color, marginBottom: 4 }}>{s.value}</p>
              <p style={{ color: '#9ca3af', fontSize: 13 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Pending applications */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>
            Pending Applications
            {pending && pending.length > 0 && <span style={{ background: '#f59e0b', color: '#000', borderRadius: 20, padding: '2px 10px', fontSize: 13, fontWeight: 700, marginLeft: 12 }}>{pending.length}</span>}
          </h2>
          {!pending || pending.length === 0 ? (
            <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, padding: '40px 24px', textAlign: 'center' }}>
              <p style={{ fontSize: 32, marginBottom: 12 }}>🎉</p>
              <p style={{ color: '#9ca3af' }}>No pending applications — you&apos;re all caught up!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {pending.map((c: any) => (
                <div key={c.id} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, padding: '20px 24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 2 }}>{c.profiles?.full_name}</p>
                      <p style={{ color: '#9ca3af', fontSize: 13, marginBottom: 4 }}>{c.profiles?.email}</p>
                      <p style={{ color: '#a78bfa', fontSize: 13, marginBottom: 4 }}>{c.specialty} · {c.location}</p>
                      {c.bio && <p style={{ color: '#9ca3af', fontSize: 13, maxWidth: 500, lineHeight: 1.5, marginTop: 8, fontStyle: 'italic' }}>{c.bio}</p>}
                      <p style={{ color: '#9ca3af', fontSize: 12, marginTop: 8 }}>Applied {new Date(c.created_at).toLocaleDateString()}</p>
                    </div>
                    <AdminActions creatorId={c.id} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Approved creators */}
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Active Creators ({approved?.length || 0})</h2>
          <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, overflow: 'hidden' }}>
            {!approved || approved.length === 0 ? (
              <p style={{ padding: '24px', color: '#9ca3af', textAlign: 'center' }}>No approved creators yet</p>
            ) : approved.map((c: any, i: number) => (
              <div key={c.id} style={{ padding: '16px 24px', borderBottom: i < approved.length - 1 ? '1px solid #2a2a2a' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{c.profiles?.full_name}</p>
                  <p style={{ color: '#9ca3af', fontSize: 13 }}>{c.specialty} · {c.location}</p>
                </div>
                <AdminActions creatorId={c.id} showReject />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
