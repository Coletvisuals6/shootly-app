'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/client'

interface Conv { id: string; client_id: string; client_name: string; last_message: string; unread: number }
interface Msg { id: string; sender_id: string; content: string; created_at: string }

export default function CreatorMessages() {
  const [convs, setConvs] = useState<Conv[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [messages, setMessages] = useState<Msg[]>([])
  const [text, setText] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/signin'); return }
      setUserId(user.id)
      const { data } = await supabase.from('conversations').select('*, profiles!conversations_client_id_fkey(*), messages(*)').eq('creator_id', user.id)
      const formatted: Conv[] = (data || []).map((c: any) => ({
        id: c.id, client_id: c.client_id,
        client_name: c.profiles?.full_name || c.profiles?.email || 'Client',
        last_message: c.messages?.slice(-1)[0]?.content || 'No messages yet',
        unread: c.messages?.filter((m: any) => !m.read && m.sender_id !== user.id).length || 0
      }))
      setConvs(formatted)
    }
    load()
  }, [])

  useEffect(() => {
    if (!selected || !userId) return
    const load = async () => {
      const { data } = await supabase.from('messages').select('*').eq('conversation_id', selected).order('created_at')
      setMessages(data || [])
      await supabase.from('messages').update({ read: true }).eq('conversation_id', selected).neq('sender_id', userId)
      setConvs(prev => prev.map(c => c.id === selected ? { ...c, unread: 0 } : c))
    }
    load()
    const channel = supabase.channel(`msgs-${selected}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${selected}` }, payload => {
      setMessages(prev => [...prev, payload.new as Msg])
    }).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [selected])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = async () => {
    if (!text.trim() || !selected || !userId) return
    await supabase.from('messages').insert({ conversation_id: selected, sender_id: userId, content: text })
    setText('')
  }

  const inputStyle = { flex: 1, background: '#141414', border: '1px solid #2a2a2a', borderRadius: 8, padding: '12px 14px', color: '#fff', fontSize: 14, outline: 'none', fontFamily: 'inherit' }

  return (
    <div>
      <Navbar />
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Messages</h1>
          <button onClick={() => router.push('/dashboard/creator')} style={{ background: 'transparent', border: '1px solid #2a2a2a', color: '#9ca3af', borderRadius: 8, padding: '8px 14px', fontSize: 13, cursor: 'pointer' }}>← Dashboard</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20, height: 560 }}>
          {/* Sidebar */}
          <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #2a2a2a' }}>
              <p style={{ fontWeight: 600, fontSize: 14, color: '#9ca3af' }}>Conversations</p>
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {convs.length === 0 ? <p style={{ padding: 16, color: '#9ca3af', fontSize: 13 }}>No messages yet</p> : convs.map(c => (
                <div key={c.id} onClick={() => setSelected(c.id)} style={{ padding: '14px 16px', borderBottom: '1px solid #1f1f1f', cursor: 'pointer', background: selected === c.id ? '#1f1535' : 'transparent', borderLeft: `3px solid ${selected === c.id ? '#7c3aed' : 'transparent'}`, transition: 'all 0.15s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <p style={{ fontWeight: 600, fontSize: 14 }}>{c.client_name}</p>
                    {c.unread > 0 && <span style={{ background: '#7c3aed', color: '#fff', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>{c.unread}</span>}
                  </div>
                  <p style={{ color: '#9ca3af', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.last_message}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Chat */}
          <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {!selected ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>Select a conversation</div>
            ) : (
              <>
                <div style={{ padding: '14px 20px', borderBottom: '1px solid #2a2a2a' }}>
                  <p style={{ fontWeight: 600 }}>{convs.find(c => c.id === selected)?.client_name}</p>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {messages.map(m => {
                    const mine = m.sender_id === userId
                    return (
                      <div key={m.id} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start' }}>
                        <div style={{ maxWidth: '70%', background: mine ? 'linear-gradient(135deg,#ec4899,#8b5cf6)' : '#141414', border: mine ? 'none' : '1px solid #2a2a2a', borderRadius: mine ? '12px 12px 2px 12px' : '12px 12px 12px 2px', padding: '10px 14px' }}>
                          <p style={{ fontSize: 14 }}>{m.content}</p>
                          <p style={{ fontSize: 11, color: mine ? 'rgba(255,255,255,0.6)' : '#666', marginTop: 4 }}>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={bottomRef} />
                </div>
                <div style={{ padding: '12px 16px', borderTop: '1px solid #2a2a2a', display: 'flex', gap: 10 }}>
                  <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Type a message..." style={inputStyle} />
                  <button onClick={send} disabled={!text.trim()} style={{ background: 'linear-gradient(135deg,#ec4899,#8b5cf6)', color: '#fff', border: 'none', borderRadius: 8, padding: '0 20px', fontWeight: 600, cursor: 'pointer', opacity: text.trim() ? 1 : 0.5 }}>Send</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
