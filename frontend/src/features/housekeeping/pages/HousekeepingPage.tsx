import { useState, useEffect, useCallback } from 'react'
import { Plus, X } from 'lucide-react'
import { Card, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import Select from '@/components/ui/select'
import api from '@/services/api'

export default function HousekeepingPage() {
  const [tasks, setTasks] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showAssign, setShowAssign] = useState(false)
  const [saving, setSaving] = useState(false)
  const [completingId, setCompletingId] = useState<number | null>(null)
  const [rooms, setRooms] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [filterDeptId, setFilterDeptId] = useState('')
  const [form, setForm] = useState({ roomId: '', assignedTo: '', notes: '' })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await api.get('/housekeeping/tasks', { params: { limit: 50 } })
      setTasks(r.data.data || [])
      setTotal(r.data.total || 0)
    } catch { /* ignore */ }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    api.get('/rooms', { params: { limit: 100 } }).then(r => setRooms(r.data.data || [])).catch(() => {})
    api.get('/employees/departments').then(r => setDepartments(r.data || [])).catch(() => {})
    api.get('/employees', { params: { limit: 100 } }).then(r => setEmployees(r.data.data || [])).catch(() => {})
  }, [])

  const completeTask = async (id: number) => {
    setCompletingId(id)
    try {
      await api.patch(`/housekeeping/tasks/${id}`)
      load()
    } catch { alert('Failed to complete task') }
    setCompletingId(null)
  }

  const assign = async () => {
    if (!form.roomId) return
    setSaving(true)
    try {
      await api.post('/housekeeping/tasks', {
        roomId: parseInt(form.roomId),
        assignedTo: form.assignedTo ? parseInt(form.assignedTo) : undefined,
        notes: form.notes,
      })
      setShowAssign(false)
      setForm({ roomId: '', assignedTo: '', notes: '' })
      load()
    } catch { alert('Failed to assign task') }
    setSaving(false)
  }

  return (
    <div className="page-container">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-heading font-bold text-theme-text">Housekeeping</h1><p className="text-theme-text opacity-50 mt-1">{total} total tasks</p></div>
        <Button variant="primary" onClick={() => setShowAssign(true)}><Plus size={18} /> Assign Task</Button>
      </div>

      <Card>
        <CardTitle className="mb-4">Cleaning Queue</CardTitle>
        {loading ? (
          <div className="text-center py-12 text-theme-text opacity-50">Loading...</div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12 text-theme-text opacity-50">No tasks found.</div>
        ) : (
          <div className="space-y-3">
            {tasks.map((t: any) => (
              <div key={t.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-[14px] bg-theme-surface">
                <div className="flex items-center gap-4">
                  <div><span className="text-theme-text font-bold text-lg">Room {t.room?.roomNumber || '—'}</span></div>
                  <Badge variant={t.status === 'PENDING' ? 'danger' : t.status === 'IN_PROGRESS' ? 'info' : 'gold'}>{t.status}</Badge>
                  {t.priority && <Badge variant={t.priority === 'VIP' ? 'danger' : t.priority === 'HIGH' ? 'warning' : 'default'}>{t.priority}</Badge>}
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm text-theme-text opacity-70">{t.assignedEmployee ? `${t.assignedEmployee.firstName} ${t.assignedEmployee.lastName}` : 'Unassigned'}</p>
                  </div>
                  {t.status !== 'COMPLETED' && (
                    <button disabled={completingId === t.id} onClick={() => completeTask(t.id)} className="px-3 py-1 rounded-lg bg-success/20 hover:bg-success/40 text-success text-xs disabled:opacity-30">{completingId === t.id ? 'Completing...' : 'Complete'}</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {showAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowAssign(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[22px] p-8 modal-mobile max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowAssign(false)} className="absolute top-4 right-4 text-white/60 hover:text-white"><X size={24} /></button>
            <h3 className="text-2xl font-heading font-bold text-white mb-6">Assign Task</h3>
            <Select
              label="Room"
              value={form.roomId}
              onChange={(v) => setForm({ ...form, roomId: v })}
              options={[
                { value: '', label: 'Select room' },
                ...rooms.map((r: any) => ({ value: String(r.id), label: `Room ${r.roomNumber} — ${r.roomType?.name || ''}` })),
              ]}
              placeholder="Select room"
            />
            <Select
              label="Department"
              value={filterDeptId}
              onChange={(v) => { setFilterDeptId(v); setForm({ ...form, assignedTo: '' }) }}
              options={[
                { value: '', label: 'All departments' },
                ...departments.map((d: any) => ({ value: String(d.id), label: d.name })),
              ]}
              placeholder="Filter by department"
            />
            <Select
              label="Assign to Employee"
              value={form.assignedTo}
              onChange={(v) => setForm({ ...form, assignedTo: v })}
              options={[
                { value: '', label: 'Unassigned' },
                ...employees
                  .filter((e: any) => !filterDeptId || String(e.departmentId) === filterDeptId)
                  .map((e: any) => ({ value: String(e.id), label: `${e.firstName} ${e.lastName}` })),
              ]}
              placeholder="Select employee"
            />
            <Input label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="e.g., Deep clean required" />
            <div className="flex gap-2 pt-2">
              <Button variant="primary" className="flex-1" onClick={assign} disabled={saving || !form.roomId}>{saving ? 'Saving...' : 'Assign Task'}</Button>
              <Button variant="secondary" onClick={() => setShowAssign(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
