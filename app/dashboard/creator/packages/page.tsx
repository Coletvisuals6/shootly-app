'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/client'
import type { Package } from '@/lib/types'

export default function ManagePackages() {
  const [packages, setPackages] = useState<Package[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [editing, setEditing] = useState<Partial<Package> | null>(null)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/signin'); return }
      setUserId(user.id)
      const { data } = await supabase.from('packages').select('*').eq('creator_id', user.id).order('created_at')
      setPackages(data || [])
    }
    load()
  }, [])

  const startNew = () => setEditing({ name: '', description: '', price: 0, features: [], is_active: true })

  const savePackage = async () => {
    if (!userId || !editing) return
    setSaving(true)
    if (editing.id) {
      await supabase.from('packages').update({ name: editing.name, description: editing.description, price: editing.price, features: editing.features }).eq('id', editing.id)
      setPackages(prev => prev.map(p => p.id === editing.id ? { ...p, ...editing } as Package : p))
    } else {
      const { data } = await supabase.from('packages').insert({ creator_id: userId, name: editing.name, description: editing.description, price: editing.price, features: editing.features || [] }).select().single()
      if (data) setPackages(prev => [...prev, data])
    }
    setSaving(false); setEditing(null)
  }

  const deletePackage = async (id: string) => {
    if (!confirm('Delete this package?')) return
    await supabase.from('packages').delete().eq('id', id)
    setPackages(prev => prev.filter(p => p.id !== id))
  }

  const inputStyle = { width: '100%', background: '#141414', border: '1px solid #2a2a2a', borderRadius: 8, padding: '10px 14px', color: '#fff', fontSize: 14, outline: 'none', fontFamily: 'inherit' }

  return (
    <div>
      <Navbar />
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Packages</h1>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => router.push('/dashboard/creator')} style={{ background: 'transparent', border: '1px solid #2a2a2a', color: '#9ca3af', borderRadius: 8, padding: '8px 14px', fontSize: 13, cursor: 'pointer' }}>← Dashboard</button>
            <button onClick={startNew} style={{ background: 'linear-gradient(135deg,#ec4899,#8b5cf6)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>+ Add Package</button>
          </div>
        </div>

        {editing && (
          <div style={{ background: '#1a1a1a', border: '2px solid #7c3aed', borderRadius: 12, padding: 28, marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>{editing.id ? 'Edit' : 'New'} Package</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: 13, color: '#9ca3af', display: 'block', marginBottom: 6 }}>Package Name</label>
                <input value={editing.name || ''} onChange={e => setEditing(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Full Wedding Day" style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 13, color: '#9ca3af', display: 'block', marginBottom: 6 }}>Price ($)</label>
                <input type="number" value={editing.price || 0} onChange={e => setEditing(p => ({ ...p, price: Number(e.target.value) }))} style={inputStyle} min={0} />
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 13, color: '#9ca3af', display: 'block', marginBottom: 6 }}>Description</label>
              <input value={editing.description || ''} onChange={e => setEditing(p => ({ ...p, description: e.target.value }))} placeholder="Short description of this package" style={inputStyle} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, color: '#9ca3af', display: 'block', marginBottom: 6 }}>Features (one per line)</label>
              <textarea
                value={(editing.features || []).join('\n')}
                onChange={e => setEditing(p => ({ ...p, features: e.target.value.split('\n').filter(Boolean) }))}
                placeholder={'4 hours coverage\n150+ edited photos\nOnline gallery'}
                style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setEditing(null)} style={{ flex: 1, background: '#141414', border: '1px solid #2a2a2a', color: '#fff', borderRadius: 8, padding: 12, fontSize: 14, cursor: 'pointer' }}>Cancel</button>
              <button onClick={savePackage} disabled={saving} style={{ flex: 2, background: 'linear-gradient(135deg,#ec4899,#8b5cf6)', color: '#fff', border: 'none', borderRadius: 8, padding: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Saving...' : 'Save Package'}
              </button>
            </div>
          </div>
        )}

        {packages.length === 0 && !editing ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12 }}>
            <p style={{ fontSize: 40, marginBottom: 16 }}>📦</p>
            <p style={{ color: '#9ca3af', fontSize: 15, marginBottom: 20 }}>No packages yet. Add your first service package to start getting bookings.</p>
            <button onClick={startNew} style={{ background: 'linear-gradient(135deg,#ec4899,#8b5cf6)', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Add Your First Package</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {packages.map(pkg => (
              <div key={pkg.id} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, padding: '20px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 2 }}>{pkg.name}</p>
                    <p style={{ color: '#9ca3af', fontSize: 13 }}>{pkg.description}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontWeight: 700, fontSize: 18 }}>${pkg.price}</span>
                    <button onClick={() => setEditing(pkg)} style={{ background: '#141414', border: '1px solid #2a2a2a', color: '#a78bfa', borderRadius: 7, padding: '6px 12px', fontSize: 12, cursor: 'pointer' }}>Edit</button>
                    <button onClick={() => deletePackage(pkg.id)} style={{ background: '#2a1a1a', border: '1px solid #5a2020', color: '#f87171', borderRadius: 7, padding: '6px 12px', fontSize: 12, cursor: 'pointer' }}>Delete</button>
                  </div>
                </div>
                <ul style={{ listStyle: 'none', fontSize: 13, color: '#9ca3af', display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                  {pkg.features.map((f, i) => <li key={i} style={{ background: '#141414', border: '1px solid #2a2a2a', borderRadius: 5, padding: '3px 10px' }}>✓ {f}</li>)}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
