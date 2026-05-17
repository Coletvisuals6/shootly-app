'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AdminActions({ creatorId, showReject }: { creatorId: string; showReject?: boolean }) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const setStatus = async (status: string) => {
    if (!confirm(`${status === 'approved' ? 'Approve' : 'Reject'} this creator?`)) return
    setLoading(true)
    await supabase.from('creators').update({ status }).eq('id', creatorId)
    router.refresh()
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
      {!showReject && (
        <button onClick={() => setStatus('approved')} disabled={loading} style={{ background: '#1a2e1a', border: '1px solid #2d5a2d', color: '#4ade80', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
          ✓ Approve
        </button>
      )}
      <button onClick={() => setStatus('rejected')} disabled={loading} style={{ background: '#2a1a1a', border: '1px solid #5a2020', color: '#f87171', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
        ✗ {showReject ? 'Remove' : 'Reject'}
      </button>
    </div>
  )
}
