import { useState, useEffect, useCallback } from 'react'
import { Plus, X, Pencil, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'

import api from '@/services/api'

const statusColor: Record<string, 'success' | 'danger' | 'gold' | 'info' | 'warning'> = {
  AVAILABLE: 'success',
  OCCUPIED: 'danger',
  BOOKED: 'gold',
  RESERVED: 'gold',
  CLEANING: 'info',
  MAINTENANCE: 'warning',
  INSPECTION: 'info',
  OUT_OF_SERVICE: 'danger',
}

export default function RoomsAdminPage() {
  const [rooms, setRooms] = useState<any[]>([])
  const [roomTypes, setRoomTypes] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingRoom, setEditingRoom] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ roomNumber: '', roomTypeId: '', floor: '', description: '', status: 'AVAILABLE' })
  const limit = 20

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await api.get('/rooms', { params: { page, limit } })
      setRooms(r.data.data)
      setTotal(r.data.total)
    } catch { /* ignore */ }
    setLoading(false)
  }, [page])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    api.get('/cms/room-types').then(r => setRoomTypes(Array.isArray(r.data?.data) ? r.data.data : Array.isArray(r.data) ? r.data : [])).catch(() => {})
  }, [])

  const openAdd = () => {
    setEditingRoom(null)
    setForm({ roomNumber: '', roomTypeId: '', floor: '', description: '', status: 'AVAILABLE' })
    setShowModal(true)
  }

  const openEdit = (room: any) => {
    setEditingRoom(room)
    setForm({
      roomNumber: String(room.roomNumber),
      roomTypeId: String(room.roomTypeId || ''),
      floor: String(room.floor),
      description: room.description || '',
      status: room.status,
    })
    setShowModal(true)
  }

  const save = async () => {
    if (!form.roomNumber || !form.roomTypeId || !form.floor) return
    setSaving(true)
    try {
      const payload = {
        roomNumber: form.roomNumber,
        roomTypeId: parseInt(form.roomTypeId),
        floor: parseInt(form.floor),
        description: form.description || undefined,
        status: form.status,
      }
      if (editingRoom) {
        await api.put(`/rooms/${editingRoom.id}`, payload)
      } else {
        await api.post('/rooms', payload)
      }
      setShowModal(false)
      load()
    } catch (e: any) { alert(e.response?.data?.message || 'Failed to save room') }
    setSaving(false)
  }

  const deleteRoom = async (room: any) => {
    if (!confirm(`Delete Room ${room.roomNumber}?`)) return
    try {
      await api.delete(`/rooms/${room.id}`)
      load()
    } catch (e: any) { alert(e.response?.data?.message || 'Failed to delete room') }
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="page-container">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-heading font-bold text-theme-text">Rooms</h1><p className="text-theme-text opacity-50 mt-1">{total} total rooms</p></div>
        <Button variant="primary" onClick={openAdd}><Plus size={18} /> Add Room</Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-theme-text opacity-50">Loading...</div>
      ) : rooms.length === 0 ? (
        <div className="text-center py-12 text-theme-text opacity-50">No rooms found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4">
          {rooms.map((room: any) => (
            <Card key={room.id} className="card-responsive relative group min-h-[180px]">
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all">
                <button onClick={() => openEdit(room)} className="p-1.5 rounded-lg bg-gold-500/80 text-theme-text hover:bg-gold-500"><Pencil size={14} /></button>
              </div>
              <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all">
                <button onClick={() => deleteRoom(room)} className="p-1.5 rounded-lg bg-danger/80 text-theme-text hover:bg-danger"><Trash2 size={14} /></button>
              </div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-heading font-bold text-theme-text">Room {room.roomNumber}</h3>
                <Badge variant={statusColor[room.status] || 'default'}>{room.status}</Badge>
              </div>
              <p className="text-theme-text opacity-50 text-sm mb-1">{room.roomType?.name || '—'} — Floor {room.floor}</p>
              <p className="text-gold-500 font-bold text-lg">KSh {room.roomType?.price?.toLocaleString()}<span className="text-theme-text opacity-40 text-sm font-normal">/night</span></p>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-3 py-1.5 rounded-lg bg-theme-surface text-theme-text opacity-70 hover:opacity-100 disabled:opacity-30">Prev</button>
          <span className="text-sm text-theme-text opacity-50">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="px-3 py-1.5 rounded-lg bg-theme-surface text-theme-text opacity-70 hover:opacity-100 disabled:opacity-30">Next</button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[22px] p-8 modal-mobile max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-white/60 hover:text-white"><X size={24} /></button>
            <h3 className="text-2xl font-heading font-bold text-white mb-6">{editingRoom ? 'Edit Room' : 'Add Room'}</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input label="Room Number" value={form.roomNumber} onChange={(e) => setForm({ ...form, roomNumber: e.target.value })} placeholder="101" />
                <Input label="Floor" type="number" value={form.floor} onChange={(e) => setForm({ ...form, floor: e.target.value })} placeholder="1" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-theme-text/80">Room Type</label>
                <select
                  value={form.roomTypeId}
                  onChange={(e) => setForm({ ...form, roomTypeId: e.target.value })}
                  className="flex h-14 w-full items-center justify-between rounded-[14px] border border-theme bg-theme-card px-4 py-3 text-sm text-theme-text outline-none transition-all duration-200 focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30"
                >
                  <option value="" disabled>Select room type</option>
                  {roomTypes.map((t: any) => (
                    <option key={t.id} value={String(t.id)}>{t.name} — KSh {t.price ? Number(t.price).toLocaleString() : '—'}</option>
                  ))}
                </select>
              </div>
              <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional description" />
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-theme-text/80">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="flex h-14 w-full items-center justify-between rounded-[14px] border border-theme bg-theme-card px-4 py-3 text-sm text-theme-text outline-none transition-all duration-200 focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30"
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="BOOKED">Booked</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="OUT_OF_SERVICE">Out of Service</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="primary" className="flex-1" onClick={save} disabled={saving || !form.roomNumber || !form.roomTypeId || !form.floor}>
                  {saving ? 'Saving...' : editingRoom ? 'Update Room' : 'Create Room'}
                </Button>
                <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
