import { useState, useEffect, useCallback } from 'react'
import { Plus, X } from 'lucide-react'
import { Card, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import Select from '@/components/ui/select'
import api from '@/services/api'

export default function MaintenancePage() {
  const [tickets, setTickets] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [showReport, setShowReport] = useState(false)
  const [saving, setSaving] = useState(false)
  const [completingId, setCompletingId] = useState<number | null>(null)
  const [rooms, setRooms] = useState<any[]>([])
  const [form, setForm] = useState({ roomId: '', title: '', description: '', priority: 'MEDIUM' })
  const limit = 20

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await api.get('/maintenance', { params: { page, limit } })
      setTickets(r.data.data)
      setTotal(r.data.total)
    } catch { /* ignore */ }
    setLoading(false)
  }, [page])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    api.get('/rooms', { params: { limit: 100 } }).then(r => setRooms(r.data.data || [])).catch(() => {})
  }, [])

  const create = async () => {
    if (!form.title || !form.roomId) return
    setSaving(true)
    try {
      await api.post('/maintenance', {
        roomId: parseInt(form.roomId),
        title: form.title,
        description: form.description,
        priority: form.priority,
      })
      setShowReport(false)
      setForm({ roomId: '', title: '', description: '', priority: 'MEDIUM' })
      load()
    } catch { alert('Failed to create ticket') }
    setSaving(false)
  }

  const complete = async (id: number) => {
    setCompletingId(id)
    try { await api.patch(`/maintenance/${id}/complete`); load() } catch { alert('Failed') }
    setCompletingId(null)
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="page-container">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-heading font-bold text-theme-text">Maintenance</h1><p className="text-theme-text opacity-50 mt-1">{total} total tickets</p></div>
        <Button variant="primary" onClick={() => setShowReport(true)}><Plus size={18} /> Report Issue</Button>
      </div>

      <Card>
        <CardTitle className="mb-4">Maintenance Tickets</CardTitle>
        {loading ? (
          <div className="text-center py-12 text-theme-text opacity-50">Loading...</div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-12 text-theme-text opacity-50">No tickets found.</div>
        ) : (
          <>
            <div className="space-y-3">
              {tickets.map((t: any) => (
                <div key={t.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-[14px] bg-theme-surface">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-theme-text font-medium">{t.title}</span>
                      {t.priority && <Badge variant={t.priority === 'HIGH' ? 'danger' : t.priority === 'MEDIUM' ? 'warning' : 'default'}>{t.priority}</Badge>}
                    </div>
                    <p className="text-xs text-theme-text opacity-50">Room {t.room?.roomNumber || '—'} | Assigned: {t.assignedToUser?.username || '—'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={t.status === 'IN_PROGRESS' ? 'info' : t.status === 'ASSIGNED' ? 'gold' : 'default'}>{t.status?.replace(/_/g, ' ')}</Badge>
                    {t.status !== 'COMPLETED' && (
                      <button disabled={completingId === t.id} onClick={() => complete(t.id)} className="px-3 py-1 rounded-lg bg-success/20 hover:bg-success/40 text-success text-xs disabled:opacity-30">{completingId === t.id ? 'Completing...' : 'Complete'}</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg bg-theme-surface text-theme-text opacity-70 hover:opacity-100 disabled:opacity-30">Prev</button>
                <span className="text-sm text-theme-text opacity-50">Page {page} of {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="px-3 py-1.5 rounded-lg bg-theme-surface text-theme-text opacity-70 hover:opacity-100 disabled:opacity-30">Next</button>
              </div>
            )}
          </>
        )}
      </Card>

      {showReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowReport(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[22px] p-8 modal-mobile max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowReport(false)} className="absolute top-4 right-4 text-white/60 hover:text-white"><X size={24} /></button>
            <h3 className="text-2xl font-heading font-bold text-white mb-6">Report Issue</h3>
            <Select
              label="Room"
              value={form.roomId}
              onChange={(v) => setForm({ ...form, roomId: v })}
              options={[
                { value: '', label: 'Select room' },
                ...rooms.map((r: any) => ({ value: String(r.id), label: `Room ${r.roomNumber}` })),
              ]}
              placeholder="Select room"
            />
            <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="AC Not Working" />
            <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Detailed description..." />
            <Select
              label="Priority"
              value={form.priority}
              onChange={(v) => setForm({ ...form, priority: v })}
              options={[
                { value: 'LOW', label: 'Low' },
                { value: 'MEDIUM', label: 'Medium' },
                { value: 'HIGH', label: 'High' },
              ]}
            />
            <div className="flex gap-2 pt-2">
              <Button variant="primary" className="flex-1" onClick={create} disabled={saving || !form.title || !form.roomId}>{saving ? 'Saving...' : 'Submit Ticket'}</Button>
              <Button variant="secondary" onClick={() => setShowReport(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
