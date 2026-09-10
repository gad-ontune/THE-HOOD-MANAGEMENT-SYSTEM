import { useState, useEffect, useCallback } from 'react'
import { Plus, X, Eye } from 'lucide-react'
import { Card, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import PhoneInput from '@/components/ui/phone-input'
import api from '@/services/api'

export default function EventsAdminPage() {
  const [events, setEvents] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ eventName: '', eventDate: '', guestCount: '', hall: '', contactName: '', contactPhone: '' })
  const limit = 15

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await api.get('/events', { params: { page, limit } })
      setEvents(r.data.data)
      setTotal(r.data.total)
    } catch { /* ignore */ }
    setLoading(false)
  }, [page])

  useEffect(() => { load() }, [load])

  const create = async () => {
    if (!form.eventName || !form.eventDate || !form.contactName || form.contactPhone.length !== 9) return
    setSaving(true)
    try {
      await api.post('/events', {
        eventName: form.eventName,
        eventDate: new Date(form.eventDate).toISOString(),
        guestCount: parseInt(form.guestCount) || 0,
        contactName: form.contactName,
        contactPhone: form.contactPhone,
      })
      setShowNew(false)
      setForm({ eventName: '', eventDate: '', guestCount: '', hall: '', contactName: '', contactPhone: '' })
      load()
    } catch { alert('Failed to create booking') }
    setSaving(false)
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="page-container">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-heading font-bold text-theme-text">Events & Conference</h1><p className="text-theme-text opacity-50 mt-1">{total} total bookings</p></div>
        <Button variant="primary" onClick={() => setShowNew(true)}><Plus size={18} /> New Booking</Button>
      </div>

      <Card>
        <CardTitle className="mb-4">Event Bookings</CardTitle>
        {loading ? (
          <div className="text-center py-12 text-theme-text opacity-50">Loading...</div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 text-theme-text opacity-50">No bookings found.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-theme">
                  {['Event', 'Hall', 'Date', 'Guests', 'Status', 'Actions'].map((h, idx) => {
                    const priority = idx === 0 || idx >= 4 ? 'table-col-priority-1' : 'table-col-priority-2'
                    return <th key={h} className={`table-header ${priority}`}>{h}</th>
                  })}
                </tr></thead>
                <tbody>
                  {events.map((e: any) => (
                    <tr key={e.id} className="border-b border-theme hover:bg-theme-surface transition-colors">
                      <td className="table-cell table-col-priority-1">{e.eventName}</td>
                      <td className="table-cell table-col-priority-2">{e.hall?.name || e.hall || '—'}</td>
                      <td className="table-cell table-col-priority-2">{e.eventDate ? new Date(e.eventDate).toLocaleDateString() : '—'}</td>
                      <td className="table-cell table-col-priority-2">{e.guestCount || '—'}</td>
                      <td className="table-cell table-col-priority-1"><Badge variant={e.status === 'CONFIRMED' ? 'success' : 'gold'}>{e.status || 'PLANNED'}</Badge></td>
                      <td className="table-cell table-col-priority-1"><button className="p-1.5 rounded-lg bg-theme-surface hover:bg-gold-500/20 text-theme-text"><Eye size={14} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowNew(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[22px] p-8 modal-mobile max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowNew(false)} className="absolute top-4 right-4 text-white/60 hover:text-white"><X size={24} /></button>
            <h3 className="text-2xl font-heading font-bold text-white mb-6">New Event Booking</h3>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <Input label="Event Name" value={form.eventName} onChange={(e) => setForm({ ...form, eventName: e.target.value })} placeholder="Wedding Reception" />
               <Input label="Event Date" type="date" value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} />
               <Input label="Expected Guests" type="number" value={form.guestCount} onChange={(e) => setForm({ ...form, guestCount: e.target.value })} placeholder="100" />
               <Input label="Contact Name" value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} placeholder="John Doe" />
             </div>
             <PhoneInput label="Contact Phone" required value={form.contactPhone} onChange={(v) => setForm({ ...form, contactPhone: v })} placeholder="712 345 678" />
            <div className="flex gap-2 pt-2">
              <Button variant="primary" className="flex-1" onClick={create} disabled={saving || !form.eventName || !form.eventDate || !form.contactName || form.contactPhone.length !== 9}>
                {saving ? 'Saving...' : 'Create Booking'}
              </Button>
              <Button variant="secondary" onClick={() => setShowNew(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
