import { useState, useEffect, useCallback } from 'react'
import { Plus, X, Eye, Ban, LogIn, LogOut } from 'lucide-react'
import { Card, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import PhoneInput from '@/components/ui/phone-input'
import Select from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils'
import api from '@/services/api'

const statusMap: Record<string, 'success' | 'gold' | 'info' | 'danger'> = {
  CHECKED_IN: 'info',
  CONFIRMED: 'success',
  PENDING: 'gold',
  CANCELLED: 'danger',
  COMPLETED: 'info',
}

const fmt = (s: string) => s?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || '—'
const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString() : '—'

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [viewRes, setViewRes] = useState<any>(null)
  const limit = 15

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params: any = { page, limit }
      if (statusFilter) params.status = statusFilter.toUpperCase()
      if (search) params.search = search
      const r = await api.get('/reservations', { params })
      setReservations(r.data.data)
      setTotal(r.data.total)
    } catch { /* ignore */ }
    setLoading(false)
  }, [page, statusFilter, search])

  useEffect(() => { load() }, [load])

  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const doAction = async (id: number, action: 'check-in' | 'check-out' | 'cancel') => {
    setActionLoading(id)
    try {
      if (action === 'cancel') await api.patch(`/reservations/${id}/cancel`)
      else await api.post(`/reservations/${id}/${action}`)
      load()
    } catch { alert('Action failed') }
    setActionLoading(null)
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="page-container">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-theme-text">Reservations</h1>
          <p className="text-theme-text opacity-50 mt-1">{total} total reservations</p>
        </div>
        <Button variant="primary" onClick={() => setShowNew(true)}><Plus size={18} /> New Reservation</Button>
      </div>

      <Card>
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <Input placeholder="Search guest or room..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
          </div>
          <div className="w-full sm:w-48">
            <Select
              value={statusFilter}
              onChange={(v) => { setStatusFilter(v); setPage(1) }}
              options={[
                { value: '', label: 'All Status' },
                { value: 'pending', label: 'Pending' },
                { value: 'confirmed', label: 'Confirmed' },
                { value: 'checked_in', label: 'Checked In' },
                { value: 'completed', label: 'Completed' },
                { value: 'cancelled', label: 'Cancelled' },
              ]}
              placeholder="All Status"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-theme-text opacity-50">Loading...</div>
        ) : reservations.length === 0 ? (
          <div className="text-center py-12 text-theme-text opacity-50">No reservations found.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-theme">
                    <th className="table-header table-col-priority-1">Reservation</th>
                    <th className="table-header table-col-priority-1">Guest</th>
                    <th className="table-header table-col-priority-2">Room</th>
                    <th className="table-header table-col-priority-3">Check-in</th>
                    <th className="table-header table-col-priority-3">Check-out</th>
                    <th className="table-header table-col-priority-2">Amount</th>
                    <th className="table-header table-col-priority-1">Status</th>
                    <th className="table-header table-col-priority-1">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map((r: any) => (
                    <tr key={r.id} className="border-b border-theme hover:bg-theme-surface transition-colors">
                      <td className="table-cell table-col-priority-1">{r.reservationNumber}</td>
                      <td className="table-cell table-col-priority-1">{r.guest?.firstName} {r.guest?.lastName}</td>
                      <td className="table-cell table-col-priority-2">{r.room?.roomNumber || '—'}</td>
                      <td className="table-cell table-col-priority-3">{fmtDate(r.checkIn)}</td>
                      <td className="table-cell table-col-priority-3">{fmtDate(r.checkOut)}</td>
                      <td className="table-cell table-col-priority-2">{r.totalAmount ? formatCurrency(r.totalAmount) : '—'}</td>
                      <td className="table-cell table-col-priority-1"><Badge variant={statusMap[r.status] || 'default'}>{fmt(r.status)}</Badge></td>
                      <td className="table-cell table-col-priority-1">
                        <div className="flex gap-1">
                          <button onClick={() => setViewRes(r)} className="p-1.5 rounded-lg bg-theme-surface hover:bg-gold-500/20 text-theme-text"><Eye size={14} /></button>
                          {r.status === 'CONFIRMED' && <button disabled={actionLoading === r.id} onClick={() => doAction(r.id, 'check-in')} className="p-1.5 rounded-lg bg-success/20 hover:bg-success/40 text-success disabled:opacity-30"><LogIn size={14} /></button>}
                          {r.status === 'CHECKED_IN' && <button disabled={actionLoading === r.id} onClick={() => doAction(r.id, 'check-out')} className="p-1.5 rounded-lg bg-info/20 hover:bg-info/40 text-info disabled:opacity-30"><LogOut size={14} /></button>}
                          {(r.status === 'PENDING' || r.status === 'CONFIRMED') && <button disabled={actionLoading === r.id} onClick={() => { if (confirm('Cancel this reservation?')) doAction(r.id, 'cancel') }} className="p-1.5 rounded-lg bg-danger/20 hover:bg-danger/40 text-danger disabled:opacity-30"><Ban size={14} /></button>}
                        </div>
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

      {showNew && <NewReservationModal onClose={() => setShowNew(false)} onSaved={() => { setShowNew(false); load() }} />}
      {viewRes && <ViewReservationModal reservation={viewRes} actionLoading={actionLoading} onClose={() => setViewRes(null)} onAction={doAction} />}
    </div>
  )
}

function NewReservationModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [step, setStep] = useState<'guest' | 'details'>('guest')
  const [saving, setSaving] = useState(false)
  const [guests, setGuests] = useState<any[]>([])
  const [guestSearch, setGuestSearch] = useState('')
  const [selectedGuest, setSelectedGuest] = useState<any>(null)
  const [newGuest, setNewGuest] = useState({ firstName: '', lastName: '', phone: '', email: '' })
  const [creatingGuest, setCreatingGuest] = useState(false)
  const [rooms, setRooms] = useState<any[]>([])
  const [form, setForm] = useState({ roomId: '', checkIn: '', checkOut: '', adults: 1, children: 0 })
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    try { setUser(JSON.parse(localStorage.getItem('user') || '{}')) } catch {}
    api.get('/rooms?limit=100').then(r => setRooms(r.data.data || [])).catch(() => {})
  }, [])

  const searchGuests = async (q: string) => {
    setGuestSearch(q)
    if (q.length < 2) return
    try {
      const r = await api.get('/guests', { params: { search: q, limit: 10 } })
      setGuests(r.data.data || [])
    } catch { setGuests([]) }
  }

  const createGuest = async () => {
    if (!newGuest.firstName || newGuest.phone.length !== 9) return
    setCreatingGuest(true)
    try {
      const r = await api.post('/guests', newGuest)
      setSelectedGuest(r.data)
      setStep('details')
    } catch { alert('Failed to create guest') }
    setCreatingGuest(false)
  }

  const save = async () => {
    if (!selectedGuest || !form.roomId || !form.checkIn || !form.checkOut) return
    setSaving(true)
    try {
      await api.post('/reservations', {
        guestId: selectedGuest.id,
        roomId: parseInt(form.roomId),
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        adults: form.adults,
        children: form.children,
        createdById: user?.id || null,
      })
      onSaved()
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to create reservation')
    }
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[22px] p-8 modal-mobile max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-white/60 hover:text-white"><X size={24} /></button>
        <h3 className="text-2xl font-heading font-bold text-white mb-6">New Reservation</h3>

        {step === 'guest' && (
          <div className="space-y-4">
            <p className="text-white/60 text-sm">Select existing guest or create a new one.</p>
            <Input label="Search Guests" value={guestSearch} onChange={(e) => searchGuests(e.target.value)} placeholder="Type name or phone..." />
            {guests.length > 0 && (
              <div className="max-h-40 overflow-y-auto space-y-2">
                {guests.map((g: any) => (
                  <div key={g.id} className={`p-3 rounded-xl cursor-pointer transition-colors ${selectedGuest?.id === g.id ? 'bg-gold-500/20 border border-gold-500/40' : 'bg-white/5 hover:bg-white/10'}`}
                    onClick={() => { setSelectedGuest(g); setStep('details') }}>
                    <p className="text-white font-medium">{g.firstName} {g.lastName}</p>
                    <p className="text-white/40 text-xs">{g.phone} {g.email ? `· ${g.email}` : ''}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="border-t border-white/10 pt-4">
              <p className="text-white/60 text-sm mb-3">Or create a new guest:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input label="First Name" value={newGuest.firstName} onChange={(e) => setNewGuest({ ...newGuest, firstName: e.target.value })} placeholder="John" />
                <Input label="Last Name" value={newGuest.lastName} onChange={(e) => setNewGuest({ ...newGuest, lastName: e.target.value })} placeholder="Doe" />
              </div>
              <PhoneInput label="Phone" required value={newGuest.phone} onChange={(v) => setNewGuest({ ...newGuest, phone: v })} placeholder="712 345 678" />
              <Input label="Email" value={newGuest.email} onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })} placeholder="john@example.com" />
              <Button variant="primary" className="w-full mt-3" onClick={createGuest} disabled={creatingGuest || !newGuest.firstName || newGuest.phone.length !== 9}>
                {creatingGuest ? 'Creating...' : 'Create & Continue'}
              </Button>
            </div>
          </div>
        )}

        {step === 'details' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <div className="w-10 h-10 rounded-full bg-gold-500/20 flex items-center justify-center text-gold-500 font-bold">{selectedGuest?.firstName?.[0]}{selectedGuest?.lastName?.[0]}</div>
              <div>
                <p className="text-white font-medium">{selectedGuest?.firstName} {selectedGuest?.lastName}</p>
                <p className="text-white/40 text-xs">{selectedGuest?.phone}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-theme-text/80 mb-1.5">Room</label>
              <Select
                value={form.roomId}
                onChange={(v) => setForm({ ...form, roomId: v })}
                options={[
                  { value: '', label: 'Select room' },
                  ...rooms.filter((r: any) => r.status === 'AVAILABLE' || r.status === 'RESERVED').map((r: any) => ({
                    value: String(r.id),
                    label: `Room ${r.roomNumber} — ${r.roomType?.name} (KSh ${r.price?.toLocaleString()})`,
                  })),
                ]}
                placeholder="Select room"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Check-in" type="date" value={form.checkIn} onChange={(e) => setForm({ ...form, checkIn: e.target.value })} />
              <Input label="Check-out" type="date" value={form.checkOut} onChange={(e) => setForm({ ...form, checkOut: e.target.value })} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Adults" type="number" min={1} value={form.adults} onChange={(e) => setForm({ ...form, adults: parseInt(e.target.value) || 1 })} />
              <Input label="Children" type="number" min={0} value={form.children} onChange={(e) => setForm({ ...form, children: parseInt(e.target.value) || 0 })} />
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="primary" className="flex-1" onClick={save} disabled={saving || !form.roomId || !form.checkIn || !form.checkOut}>{saving ? 'Saving...' : 'Confirm Reservation'}</Button>
              <Button variant="secondary" onClick={() => setStep('guest')}>Back</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ViewReservationModal({ reservation, actionLoading, onClose, onAction }: { reservation: any; actionLoading: number | null; onClose: () => void; onAction: (id: number, action: 'check-in' | 'check-out' | 'cancel') => void }) {
  const acting = actionLoading === reservation.id
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[22px] w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-heading font-bold text-white">{reservation.reservationNumber}</h3>
            <button onClick={onClose} className="text-white/60 hover:text-white"><X size={20} /></button>
          </div>
          <Badge variant={statusMap[reservation.status] || 'default'} className="mt-2">{fmt(reservation.status)}</Badge>
        </div>
        <div className="p-6 space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gold-500/20 flex items-center justify-center text-gold-500 font-bold text-lg">
              {reservation.guest?.firstName?.[0]}{reservation.guest?.lastName?.[0]}
            </div>
            <div>
              <p className="text-white font-semibold">{reservation.guest?.firstName} {reservation.guest?.lastName}</p>
              <p className="text-white/40 text-sm">{reservation.guest?.phone}</p>
              {reservation.guest?.email && <p className="text-white/40 text-xs">{reservation.guest.email}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-white/5">
              <p className="text-white/40 text-xs mb-1">Room</p>
              <p className="text-white font-medium">{reservation.room?.roomNumber || '—'}</p>
              <p className="text-white/40 text-xs">{reservation.room?.roomType?.name || ''}</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5">
              <p className="text-white/40 text-xs mb-1">Total Amount</p>
              <p className="text-gold-500 font-bold">{reservation.totalAmount ? formatCurrency(reservation.totalAmount) : '—'}</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5">
              <p className="text-white/40 text-xs mb-1">Check-in</p>
              <p className="text-white font-medium">{fmtDate(reservation.checkIn)}</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5">
              <p className="text-white/40 text-xs mb-1">Check-out</p>
              <p className="text-white font-medium">{fmtDate(reservation.checkOut)}</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5">
              <p className="text-white/40 text-xs mb-1">Guests</p>
              <p className="text-white font-medium">{reservation.adults || 0} Adults{reservation.children ? `, ${reservation.children} Children` : ''}</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5">
              <p className="text-white/40 text-xs mb-1">Source</p>
              <p className="text-white font-medium">{fmt(reservation.source || '—')}</p>
            </div>
          </div>
          {reservation.notes?.length > 0 && (
            <div>
              <p className="text-white/40 text-xs mb-2">Notes</p>
              {reservation.notes.map((n: any) => (
                <p key={n.id} className="text-white/60 text-sm">{n.note}</p>
              ))}
            </div>
          )}
          <div className="flex gap-2 pt-2">
            {reservation.status === 'CONFIRMED' && (
              <Button variant="primary" className="flex-1" disabled={acting} onClick={() => onAction(reservation.id, 'check-in')}>{acting ? 'Checking in...' : 'Check In'}</Button>
            )}
            {reservation.status === 'CHECKED_IN' && (
              <Button variant="primary" className="flex-1" disabled={acting} onClick={() => onAction(reservation.id, 'check-out')}>{acting ? 'Checking out...' : 'Check Out'}</Button>
            )}
            {(reservation.status === 'PENDING' || reservation.status === 'CONFIRMED') && (
              <Button variant="secondary" className="flex-1" disabled={acting} onClick={() => { if (confirm('Cancel this reservation?')) onAction(reservation.id, 'cancel') }}>{acting ? 'Cancelling...' : 'Cancel'}</Button>
            )}
            <Button variant="secondary" onClick={onClose}>Close</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
