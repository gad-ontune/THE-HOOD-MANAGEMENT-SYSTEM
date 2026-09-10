import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, X, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import PhoneInput from '@/components/ui/phone-input'
import api from '@/services/api'

export default function GuestsPage() {
  const [guests, setGuests] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', email: '', nationality: '', idNumber: '', address: '' })
  const limit = 15

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params: any = { page, limit }
      if (search) params.search = search
      const r = await api.get('/guests', { params })
      setGuests(r.data.data)
      setTotal(r.data.total)
    } catch { /* ignore */ }
    setLoading(false)
  }, [page, search])

  useEffect(() => { load() }, [load])

  const create = async () => {
    if (!form.firstName || form.phone.length !== 9) return
    setSaving(true)
    try {
      await api.post('/guests', form)
      setShowAdd(false)
      setForm({ firstName: '', lastName: '', phone: '', email: '', nationality: '', idNumber: '', address: '' })
      setPage(1)
      load()
    } catch { alert('Failed to create guest') }
    setSaving(false)
  }

  const remove = async (id: number) => {
    if (!confirm('Delete this guest?')) return
    try {
      await api.delete(`/guests/${id}`)
      load()
    } catch { alert('Failed to delete guest') }
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="page-container">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-heading font-bold text-theme-text">Guests</h1><p className="text-theme-text opacity-50 mt-1">{total} total guests</p></div>
        <Button variant="primary" onClick={() => setShowAdd(true)}><Plus size={18} /> Add Guest</Button>
      </div>
      <Card>
        <div className="flex gap-4 mb-6">
          <Input placeholder="Search guests..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} className="w-full md:max-w-sm" />
        </div>
        {loading ? (
          <div className="text-center py-12 text-theme-text opacity-50">Loading...</div>
        ) : guests.length === 0 ? (
          <div className="text-center py-12 text-theme-text opacity-50">No guests found.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-theme">
                  <th className="table-header table-col-priority-1">Guest ID</th>
                  <th className="table-header table-col-priority-1">Name</th>
                  <th className="table-header table-col-priority-2">Phone</th>
                  <th className="table-header table-col-priority-3">Email</th>
                  <th className="table-header table-col-priority-4">Nationality</th>
                  <th className="table-header table-col-priority-4">Visits</th>
                  <th className="table-header table-col-priority-1">Actions</th>
                </tr></thead>
                <tbody>
                  {guests.map((g: any) => (
                    <tr key={g.id} className="border-b border-theme hover:bg-theme-surface transition-colors">
                      <td className="table-cell table-col-priority-1">{g.guestNumber}</td>
                      <td className="table-cell table-col-priority-1">{g.firstName} {g.lastName}</td>
                      <td className="table-cell table-col-priority-2">{g.phone}</td>
                      <td className="table-cell table-col-priority-3">{g.email || '—'}</td>
                      <td className="table-cell table-col-priority-4">{g.nationality || '—'}</td>
                      <td className="table-cell table-col-priority-4">{g._count?.reservations || 0}</td>
                      <td className="table-cell table-col-priority-1">
                        <button onClick={() => remove(g.id)} className="p-1.5 rounded-lg bg-danger/20 hover:bg-danger/40 text-danger"><Trash2 size={14} /></button>
                      </td>
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

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[22px] p-8 modal-mobile max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowAdd(false)} className="absolute top-4 right-4 text-white/60 hover:text-white"><X size={24} /></button>
            <h3 className="text-2xl font-heading font-bold text-white mb-6">Add Guest</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="First Name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} placeholder="John" />
              <Input label="Last Name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} placeholder="Doe" />
            </div>
            <PhoneInput label="Phone" required value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="712 345 678" />
            <Input label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@example.com" />
            <Input label="Nationality" value={form.nationality} onChange={(e) => setForm({ ...form, nationality: e.target.value })} placeholder="Kenyan" />
            <Input label="ID Number" value={form.idNumber} onChange={(e) => setForm({ ...form, idNumber: e.target.value })} placeholder="12345678" />
            <Input label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Nairobi, Kenya" />
            <div className="flex gap-2 pt-2">
              <Button variant="primary" className="flex-1" onClick={create} disabled={saving || !form.firstName || form.phone.length !== 9}>{saving ? 'Saving...' : 'Save Guest'}</Button>
              <Button variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
