import { useState, useEffect, useCallback } from 'react'
import { Plus, X, ArrowLeft, Users } from 'lucide-react'
import { Card, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import Select from '@/components/ui/select'
import PhoneInput from '@/components/ui/phone-input'
import api from '@/services/api'

export default function EmployeesPage() {
  const [departments, setDepartments] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selectedDept, setSelectedDept] = useState<any>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', email: '', position: '', department: '' })

  const loadDepts = useCallback(async () => {
    try {
      const r = await api.get('/employees/departments')
      setDepartments(r.data || [])
    } catch { /* ignore */ }
  }, [])

  useEffect(() => { loadDepts() }, [loadDepts])

  const loadEmployees = useCallback(async (deptId: number) => {
    setLoading(true)
    try {
      const r = await api.get('/employees', { params: { limit: 50, departmentId: deptId } })
      setEmployees(r.data.data || [])
      setTotal(r.data.total || 0)
    } catch { /* ignore */ }
    setLoading(false)
  }, [])

  const selectDept = (dept: any) => {
    setSelectedDept(dept)
    loadEmployees(dept.id)
  }

  const create = async () => {
    if (!form.firstName || !form.lastName || form.phone.length !== 9) return
    setSaving(true)
    try {
      const body: any = { firstName: form.firstName, lastName: form.lastName, phone: form.phone }
      if (form.email) body.email = form.email
      if (form.position) body.position = form.position
      if (form.department) body.department = form.department
      await api.post('/employees', body)
      setShowAdd(false)
      setForm({ firstName: '', lastName: '', phone: '', email: '', position: '', department: '' })
      if (selectedDept) loadEmployees(selectedDept.id)
      loadDepts()
    } catch { alert('Failed to create employee') }
    setSaving(false)
  }

  const iconMap: Record<string, string> = {
    Management: '\u{1F3E2}', Reception: '\u{1F4C5}', Housekeeping: '\u{1F9F9}',
    Restaurant: '\u{1F37D}', Kitchen: '\u{1F373}', Finance: '\u{1F4B0}',
    Maintenance: '\u{1F527}', Security: '\u{1F6E1}', 'Human Resources': '\u{1F465}',
    'Sales & Marketing': '\u{1F4CA}', Laundry: '\u{1F9FA}', 'Events & Banqueting': '\u{1F389}',
    Engineering: '\u{2699}', Procurement: '\u{1F4E6}', IT: '\u{1F4BB}',
  }

  const totalEmployees = departments.reduce((sum, d) => sum + (d._count?.employees || 0), 0)

  if (!selectedDept) {
    return (
      <div className="page-container">
        <div className="flex items-center justify-between">
          <div><h1 className="text-3xl font-heading font-bold text-theme-text">Departments</h1><p className="text-theme-text opacity-50 mt-1">{departments.length} departments &bull; {totalEmployees} employees</p></div>
          <Button variant="primary" onClick={() => { setForm({ ...form, department: '' }); setShowAdd(true) }}><Plus size={18} /> Add Employee</Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {departments.map((dept: any) => (
            <button key={dept.id} onClick={() => selectDept(dept)} className="text-left p-6 rounded-[18px] bg-theme-surface border border-theme hover:border-gold-500/40 hover:bg-gold-500/5 transition-all group">
              <div className="text-3xl mb-3">{iconMap[dept.name] || '\u{1F3E2}'}</div>
              <h3 className="text-lg font-semibold text-theme-text group-hover:text-gold-500 transition-colors">{dept.name}</h3>
              <p className="text-sm text-theme-text opacity-50 mt-1">{dept.description}</p>
              <div className="flex items-center gap-1.5 mt-3 text-sm text-theme-text opacity-60">
                <Users size={14} />
                <span>{dept._count?.employees || 0} employees</span>
              </div>
            </button>
          ))}
        </div>

        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[22px] p-8 modal-mobile max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setShowAdd(false)} className="absolute top-4 right-4 text-white/60 hover:text-white"><X size={24} /></button>
              <h3 className="text-2xl font-heading font-bold text-white mb-6">Add Employee</h3>
              <div className="grid grid-cols-2 gap-3">
                <Input label="First Name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} placeholder="Jane" />
                <Input label="Last Name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} placeholder="Atieno" />
              </div>
              <PhoneInput label="Phone" required value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="712 345 678" />
              <Input label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="jane@example.com" />
              <Input label="Position" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} placeholder="Receptionist" />
              <Select
                label="Department"
                value={form.department}
                onChange={(v) => setForm({ ...form, department: v })}
                options={[
                  { value: '', label: 'Select department' },
                  ...departments.map((d: any) => ({ value: d.name, label: d.name })),
                ]}
                placeholder="Select department"
              />
              <div className="flex gap-2 pt-2">
                <Button variant="primary" className="flex-1" onClick={create} disabled={saving || !form.firstName || !form.lastName || form.phone.length !== 9}>{saving ? 'Saving...' : 'Save Employee'}</Button>
                <Button variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => { setSelectedDept(null); setEmployees([]) }} className="p-2 rounded-lg bg-theme-surface hover:bg-gold-500/20 text-theme-text transition-all"><ArrowLeft size={20} /></button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{iconMap[selectedDept.name] || '\u{1F3E2}'}</span>
              <h1 className="text-3xl font-heading font-bold text-theme-text">{selectedDept.name}</h1>
            </div>
            <p className="text-theme-text opacity-50 mt-1">{total} employees</p>
          </div>
        </div>
        <Button variant="primary" onClick={() => { setForm({ ...form, department: selectedDept.name }); setShowAdd(true) }}><Plus size={18} /> Add Employee</Button>
      </div>

      <Card>
        {loading ? (
          <div className="text-center py-12 text-theme-text opacity-50">Loading...</div>
        ) : employees.length === 0 ? (
          <div className="text-center py-12 text-theme-text opacity-50">No employees in this department.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
            {employees.map((emp: any) => {
              const initial = (emp.firstName?.[0] || '').toUpperCase()
              return (
                <div key={emp.id} className="p-4 rounded-[14px] bg-theme-surface border border-theme">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gold-500/20 flex items-center justify-center text-gold-500 font-bold">{initial}</div>
                    <div>
                      <p className="text-theme-text font-medium">{emp.firstName} {emp.lastName}</p>
                      <p className="text-xs text-theme-text opacity-50">{emp.position?.title || emp.position || 'Staff'}</p>
                    </div>
                    <Badge variant={emp.status === 'ON_DUTY' ? 'success' : 'warning'} className="ml-auto">{emp.status?.replace(/_/g, ' ') || 'Active'}</Badge>
                  </div>
                  <p className="text-xs text-theme-text opacity-50">{emp.department?.name || '—'}</p>
                  <p className="text-xs text-theme-text opacity-50">{emp.phone}</p>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[22px] p-8 modal-mobile max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowAdd(false)} className="absolute top-4 right-4 text-white/60 hover:text-white"><X size={24} /></button>
            <h3 className="text-2xl font-heading font-bold text-white mb-6">Add Employee</h3>
            <div className="grid grid-cols-2 gap-3">
              <Input label="First Name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} placeholder="Jane" />
              <Input label="Last Name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} placeholder="Atieno" />
            </div>
            <PhoneInput label="Phone" required value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="712 345 678" />
            <Input label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="jane@example.com" />
            <Input label="Position" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} placeholder="Receptionist" />
            <Select
              label="Department"
              value={form.department}
              onChange={(v) => setForm({ ...form, department: v })}
              options={[
                { value: '', label: 'Select department' },
                ...departments.map((d: any) => ({ value: d.name, label: d.name })),
              ]}
              placeholder="Select department"
            />
            <div className="flex gap-2 pt-2">
              <Button variant="primary" className="flex-1" onClick={create} disabled={saving || !form.firstName || !form.lastName || form.phone.length !== 9}>{saving ? 'Saving...' : 'Save Employee'}</Button>
              <Button variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
