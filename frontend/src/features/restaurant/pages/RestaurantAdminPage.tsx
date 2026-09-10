import { useState, useEffect, useCallback } from 'react'
import { Plus, X, CheckCheck, Trash2, Utensils } from 'lucide-react'
import { Card, CardTitle } from '@/components/ui/card'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import Select from '@/components/ui/select'
import api from '@/services/api'
import { cn } from '@/lib/utils'

const orderStatusColors: Record<string, string> = {
  PENDING: 'bg-yellow-500/20 text-yellow-500',
  ACCEPTED: 'bg-blue-500/20 text-blue-400',
  PREPARING: 'bg-orange-500/20 text-orange-400',
  READY: 'bg-cyan-500/20 text-cyan-400',
  SERVED: 'bg-green-500/20 text-green-400',
  COMPLETED: 'bg-emerald-500/20 text-emerald-400',
  CANCELLED: 'bg-danger/20 text-danger',
}

export default function RestaurantAdminPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [menuItems, setMenuItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ customerName: '', notes: '', totalAmount: '' })
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ show: boolean; order: any }>({ show: false, order: null })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [o, m] = await Promise.all([
        api.get('/cms/restaurant-orders'),
        api.get('/cms/menu-items'),
      ])
      setOrders(o.data || [])
      setMenuItems(m.data || [])
    } catch { /* ignore */ }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const updateStatus = async (id: number, status: string) => {
    try {
      await api.put(`/cms/restaurant-orders/${id}/status`, { status })
      load()
    } catch { alert('Failed to update status') }
  }

  const create = async () => {
    if (!form.customerName) return
    setSaving(true)
    try {
      const count = orders.length
      await api.post('/cms/restaurant-orders', {
        orderNumber: `ORD-${String(count + 1).padStart(3, '0')}`,
        customerName: form.customerName,
        notes: form.notes,
        totalAmount: parseFloat(form.totalAmount) || 0,
        status: 'PENDING',
      })
      setShowNew(false)
      setForm({ customerName: '', notes: '', totalAmount: '' })
      load()
    } catch { alert('Failed to create order') }
    setSaving(false)
  }

  const deleteOrder = async (id: number) => {
    try {
      await api.delete(`/cms/restaurant-orders/${id}`)
      load()
    } catch { alert('Failed to delete order') }
  }

  return (
    <div className="page-container">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-heading font-bold text-theme-text">Restaurant Orders</h1><p className="text-theme-text opacity-50 mt-1">{orders.length} total orders</p></div>
        <Button variant="primary" onClick={() => setShowNew(true)}><Plus size={18} /> New Order</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6">
        <Card>
          <CardTitle className="mb-4">Orders</CardTitle>
          {loading ? (
            <div className="text-center py-12 text-theme-text opacity-50">Loading...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-theme-text opacity-50">No orders yet.</div>
          ) : (
            <div className="space-y-2">
              {orders.map((o: any) => (
                <OrderCard key={o.id} order={o} onStatusChange={updateStatus} onDelete={() => setShowDeleteConfirm({ show: true, order: o })} />
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardTitle className="mb-4">Menu Items</CardTitle>
          {menuItems.length === 0 ? (
            <div className="text-center py-12 text-theme-text opacity-50">No menu items. Add some in CMS.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-theme">{['Item', 'Category', 'Price', 'Status'].map(h => <th key={h} className="text-left py-3 text-theme-text opacity-50 font-medium">{h}</th>)}</tr></thead>
                <tbody>
                  {menuItems.map((item: any) => (
                    <tr key={item.id} className="border-b border-theme">
                      <td className="py-3 text-theme-text">{item.name}</td>
                      <td className="py-3 text-theme-text opacity-70">{item.categoryId || '—'}</td>
                      <td className="py-3 text-theme-text opacity-70">KSh {(item.price || 0).toLocaleString()}</td>
                      <td className="py-3"><span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', item.available !== false ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400')}>{item.available !== false ? 'Available' : 'Unavailable'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowNew(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[22px] p-8 modal-mobile max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowNew(false)} className="absolute top-4 right-4 text-white/60 hover:text-white"><X size={24} /></button>
            <h3 className="text-2xl font-heading font-bold text-white mb-6">New Order</h3>
            <Input label="Customer Name" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} placeholder="John Doe" />
            <Input label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Order details..." />
            <Input label="Total Amount (KSh)" type="number" value={form.totalAmount} onChange={(e) => setForm({ ...form, totalAmount: e.target.value })} placeholder="2500" />
            <div className="flex gap-2 pt-2">
              <Button variant="primary" className="flex-1" onClick={create} disabled={saving || !form.customerName}>{saving ? 'Saving...' : 'Create Order'}</Button>
              <Button variant="secondary" onClick={() => setShowNew(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm.show && showDeleteConfirm.order && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowDeleteConfirm({ show: false, order: null })}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-theme-surface border border-theme rounded-[22px] p-8 max-w-sm text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-heading font-bold text-theme-text mb-4">Delete Order?</h3>
            <p className="text-theme-text opacity-60 mb-6">Are you sure you want to delete order {showDeleteConfirm.order.orderNumber}? This cannot be undone.</p>
            <div className="flex gap-3 justify-center">
              <Button variant="ghost" onClick={() => setShowDeleteConfirm({ show: false, order: null })}>Cancel</Button>
              <Button variant="danger" onClick={() => { deleteOrder(showDeleteConfirm.order.id); setShowDeleteConfirm({ show: false, order: null }); }}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function OrderCard({ order, onStatusChange, onDelete }: { order: any; onStatusChange: (id: number, status: string) => void; onDelete: () => void }) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-[14px] border bg-theme-surface hover:bg-theme-surface/80 transition-all duration-300 cursor-pointer">
      <div className={cn('w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0', orderStatusColors[order.status] || 'bg-theme-surface')}>
        <Utensils size={20} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm text-theme-text font-medium">{order.orderNumber}</p>
          <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', orderStatusColors[order.status] || 'bg-theme-surface')}>{order.status}</span>
          {!order.status.startsWith('COMPLETED') && !order.status.startsWith('CANCELLED') && (
            <CheckCheck size={14} className="text-gold-500 cursor-pointer flex-shrink-0" onClick={(e) => { e.stopPropagation(); onStatusChange(order.id, 'COMPLETED') }} />
          )}
        </div>
        <p className="text-xs text-theme-text/50">{order.customerName || '—'}</p>
        {order.notes && <p className="text-xs text-theme-text/30">{order.notes}</p>}
        <p className="text-xs text-theme-text/20 mt-1">{order.createdAt ? new Date(order.createdAt).toLocaleString() : ''}</p>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-full sm:w-48">
          <Select
            value={order.status}
            onChange={(v) => onStatusChange(order.id, v)}
            options={[
              { value: 'PENDING', label: 'Pending' },
              { value: 'ACCEPTED', label: 'Accepted' },
              { value: 'PREPARING', label: 'Preparing' },
              { value: 'READY', label: 'Ready' },
              { value: 'SERVED', label: 'Served' },
              { value: 'COMPLETED', label: 'Completed' },
              { value: 'CANCELLED', label: 'Cancelled' },
            ]}
            placeholder="Status"
          />
        </div>
        {(order.status.startsWith('COMPLETED') || order.status.startsWith('CANCELLED')) && (
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1.5 rounded-lg hover:bg-danger/20 text-danger transition-colors flex-shrink-0" title="Delete order">
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  )
}
