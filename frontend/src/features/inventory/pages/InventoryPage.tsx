import { useState, useEffect, useCallback } from 'react'
import { Plus, X } from 'lucide-react'
import { Card, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import api from '@/services/api'
import { showToast } from '@/lib/toast'

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState({ name: '', category: '', stock: '', minStock: '', unit: '', cost: '' })
  const limit = 20

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await api.get('/inventory', { params: { page, limit } })
      setItems(r.data.data)
      setTotal(r.data.total)
    } catch { /* ignore */ }
    setLoading(false)
  }, [page])

  useEffect(() => { load() }, [load])

  const create = async () => {
    if (!form.name || !form.stock) return
    setSaving(true)
    try {
      if (editingId) {
        await api.patch(`/inventory/${editingId}`, {
          name: form.name,
          currentStock: parseInt(form.stock),
          minimumStock: parseInt(form.minStock) || 0,
          unitCost: parseFloat(form.cost) || 0,
        })
      } else {
        await api.post('/inventory', {
          name: form.name,
          currentStock: parseInt(form.stock),
          minimumStock: parseInt(form.minStock) || 0,
          unitCost: parseFloat(form.cost) || 0,
        })
      }
      setShowAdd(false)
      setEditingId(null)
      setForm({ name: '', category: '', stock: '', minStock: '', unit: '', cost: '' })
      load()
    } catch { alert('Failed to save item') }
    setSaving(false)
  }

  const startEdit = (item: any) => {
    setForm({ name: item.name, category: '', stock: String(item.currentStock || ''), minStock: String(item.minimumStock || ''), unit: '', cost: String(item.unitCost || '') })
    setEditingId(item.id)
    setShowAdd(true)
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="page-container">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-heading font-bold text-theme-text">Inventory</h1><p className="text-theme-text opacity-50 mt-1">{total} total items</p></div>
        <Button variant="primary" onClick={() => setShowAdd(true)}><Plus size={18} /> Add Item</Button>
      </div>

      <Card>
        {loading ? (
          <div className="text-center py-12 text-theme-text opacity-50">Loading...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-theme-text opacity-50">No inventory items found.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-theme">
                  <th className="table-header table-col-priority-1">Item</th>
                  <th className="table-header table-col-priority-1">Stock</th>
                  <th className="table-header table-col-priority-2">Min Stock</th>
                  <th className="table-header table-col-priority-3">Unit Cost</th>
                  <th className="table-header table-col-priority-4">Total Value</th>
                  <th className="table-header table-col-priority-2">Status</th>
                  <th className="table-header table-col-priority-1">Actions</th>
                </tr></thead>
                <tbody>
                  {items.map((i: any) => (
                    <tr key={i.id} className="border-b border-theme hover:bg-theme-surface transition-colors">
                      <td className="table-cell table-col-priority-1">{i.name}</td>
                      <td className="table-cell table-col-priority-1">{i.currentStock || 0}</td>
                      <td className="table-cell table-col-priority-2">{i.minimumStock || 0}</td>
                      <td className="table-cell table-col-priority-3">KSh {(i.unitCost || 0).toLocaleString()}</td>
                      <td className="table-cell table-col-priority-4">KSh {((i.currentStock || 0) * (i.unitCost || 0)).toLocaleString()}</td>
                      <td className="table-cell table-col-priority-2"><Badge variant={(i.currentStock || 0) <= (i.minimumStock || 0) ? 'warning' : 'success'}>{(i.currentStock || 0) <= (i.minimumStock || 0) ? 'Low Stock' : 'In Stock'}</Badge></td>
                      <td className="table-cell table-col-priority-1"><Button variant="ghost" size="sm" onClick={() => startEdit(i)} disabled={saving}>Edit</Button></td>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => { setShowAdd(false); setEditingId(null) }}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[22px] p-8 modal-mobile max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => { setShowAdd(false); setEditingId(null) }} className="absolute top-4 right-4 text-white/60 hover:text-white"><X size={24} /></button>
            <h3 className="text-2xl font-heading font-bold text-white mb-6">{editingId ? 'Edit Inventory Item' : 'Add Inventory Item'}</h3>
            <Input label="Item Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Coffee Beans" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Current Stock" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="10" />
              <Input label="Min Stock" type="number" value={form.minStock} onChange={(e) => setForm({ ...form, minStock: e.target.value })} placeholder="5" />
            </div>
            <Input label="Unit Cost (KSh)" type="number" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} placeholder="1200" />
            <div className="flex gap-2 pt-2">
              <Button variant="primary" className="flex-1" onClick={create} disabled={saving || !form.name || !form.stock}>{saving ? 'Saving...' : 'Save Item'}</Button>
              <Button variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
