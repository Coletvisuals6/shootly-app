'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/client'

export default function EditProfile() {
  const [bio, setBio] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [location, setLocation] = useState('')
  const [travelMiles, setTravelMiles] = useState(25)
  const [specialties, setSpecialties] = useState<string[]>([])
  const [equipment, setEquipment] = useState<string[]>([])
  const [newSpec, setNewSpec] = useState('')
  const [newEquip, setNewEquip] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [photos, setPhotos] = useState<{ id: string; url: string }[]>([])
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/signin'); return }
      setUserId(user.id)
      const { data: c } = await supabase.from('creators').select('*, creator_specialties(*), creator_equipment(*), portfolio_photos(*)').eq('id', user.id).single()
      if (c) {
        setBio(c.bio || ''); setSpecialty(c.specialty || ''); setLocation(c.location || ''); setTravelMiles(c.travel_miles || 25)
        setSpecialties(c.creator_specialties?.map((s: { name: string }) => s.name) || [])
        setEquipment(c.creator_equipment?.map((e: { name: string }) => e.name) || [])
        setPhotos(c.portfolio_photos?.sort((a: { position: number }, b: { position: number }) => a.position - b.position) || [])
      }
    }
    load()
  }, [])

  const handleSave = async () => {
    if (!userId) return
    setSaving(true)
    await supabase.from('creators').update({ bio, specialty, location, travel_miles: travelMiles }).eq('id', userId)
    await supabase.from('creator_specialties').delete().eq('creator_id', userId)
    if (specialties.length > 0) await supabase.from('creator_specialties').insert(specialties.map(name => ({ creator_id: userId, name })))
    await supabase.from('creator_equipment').delete().eq('creator_id', userId)
    if (equipment.length > 0) await supabase.from('creator_equipment').insert(equipment.map(name => ({ creator_id: userId, name })))
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  const uploadPhoto = async (file: File) => {
    if (!userId) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${userId}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('portfolio').upload(path, file)
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from('portfolio').getPublicUrl(path)
      const { data: photo } = await supabase.from('portfolio_photos').insert({ creator_id: userId, url: publicUrl, position: photos.length }).select().single()
      if (photo) setPhotos(prev => [...prev, photo])
    }
    setUploading(false)
  }

  const deletePhoto = async (id: string) => {
    await supabase.from('portfolio_photos').delete().eq('id', id)
    setPhotos(prev => prev.filter(p => p.id !== id))
  }

  const inputStyle = { width: '100%', background: '#141414', border: '1px solid #2a2a2a', borderRadius: 8, padding: '11px 14px', color: '#fff', fontSize: 14, outline: 'none', fontFamily: 'inherit' }
  const labelStyle = { fontSize: 13, fontWeight: 500, color: '#9ca3af', display: 'block', marginBottom: 6 }
  const tagStyle = { background: '#1f1535', color: '#a78bfa', border: '1px solid #3b2a6e', borderRadius: 6, padding: '5px 10px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }

  return (
    <div>
      <Navbar />
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Edit Profile</h1>
          <button onClick={() => router.push('/dashboard/creator')} style={{ background: 'transparent', border: '1px solid #2a2a2a', color: '#9ca3af', borderRadius: 8, padding: '8px 14px', fontSize: 13, cursor: 'pointer' }}>← Dashboard</button>
        </div>

        <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, padding: 28, marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Basic Info</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div><label style={labelStyle}>Specialty</label><input value={specialty} onChange={e => setSpecialty(e.target.value)} style={inputStyle} placeholder="Wedding Videographer" /></div>
            <div><label style={labelStyle}>City / Location</label><input value={location} onChange={e => setLocation(e.target.value)} style={inputStyle} placeholder="Los Angeles, CA" /></div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Travel range (miles)</label>
            <input type="number" value={travelMiles} onChange={e => setTravelMiles(Number(e.target.value))} style={{ ...inputStyle, maxWidth: 120 }} min={0} max={500} />
          </div>
          <div>
            <label style={labelStyle}>About / Bio</label>
            <textarea value={bio} onChange={e => setBio(e.target.value)} style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }} placeholder="Tell clients about yourself..." />
          </div>
        </div>

        {/* Specialties */}
        <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, padding: 28, marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Specialties</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {specialties.map(s => (
              <span key={s} style={tagStyle}>{s}<button onClick={() => setSpecialties(prev => prev.filter(x => x !== s))} style={{ background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer', padding: 0, fontSize: 14, lineHeight: 1 }}>×</button></span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={newSpec} onChange={e => setNewSpec(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && newSpec.trim()) { setSpecialties(p => [...p, newSpec.trim()]); setNewSpec('') } }} placeholder="Add a specialty..." style={{ ...inputStyle, flex: 1 }} />
            <button onClick={() => { if (newSpec.trim()) { setSpecialties(p => [...p, newSpec.trim()]); setNewSpec('') } }} style={{ background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, padding: '0 16px', cursor: 'pointer', fontSize: 14 }}>Add</button>
          </div>
        </div>

        {/* Equipment */}
        <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, padding: 28, marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Equipment</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
            {equipment.map(e => (
              <div key={e} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#9ca3af', fontSize: 14 }}>
                <span>• {e}</span>
                <button onClick={() => setEquipment(prev => prev.filter(x => x !== e))} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: 16 }}>×</button>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={newEquip} onChange={e => setNewEquip(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && newEquip.trim()) { setEquipment(p => [...p, newEquip.trim()]); setNewEquip('') } }} placeholder="Add equipment..." style={{ ...inputStyle, flex: 1 }} />
            <button onClick={() => { if (newEquip.trim()) { setEquipment(p => [...p, newEquip.trim()]); setNewEquip('') } }} style={{ background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, padding: '0 16px', cursor: 'pointer', fontSize: 14 }}>Add</button>
          </div>
        </div>

        {/* Portfolio Photos */}
        <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, padding: 28, marginBottom: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Portfolio Photos</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 16 }}>
            {photos.map(p => (
              <div key={p.id} style={{ position: 'relative', aspectRatio: '4/3' }}>
                <img src={p.url} alt="Portfolio" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
                <button onClick={() => deletePhoto(p.id)} style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.7)', border: 'none', color: '#f87171', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
              </div>
            ))}
            <label style={{ aspectRatio: '4/3', background: '#141414', border: '2px dashed #2a2a2a', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#9ca3af', fontSize: 13, flexDirection: 'column', gap: 8 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              {uploading ? 'Uploading...' : 'Add Photo'}
              <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && uploadPhoto(e.target.files[0])} style={{ display: 'none' }} />
            </label>
          </div>
          <p style={{ color: '#9ca3af', fontSize: 12 }}>First photo will appear as your main profile photo</p>
        </div>

        <button onClick={handleSave} disabled={saving} style={{ width: '100%', background: 'linear-gradient(135deg,#ec4899,#8b5cf6)', color: 'white', border: 'none', borderRadius: 10, padding: 14, fontSize: 15, fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
          {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
