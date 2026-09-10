import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import api from '@/services/api'
import { formatCurrency } from '@/lib/utils'

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const limit = 15

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await api.get('/payments', { params: { page, limit } })
      setPayments(r.data.data)
      setTotal(r.data.total)
    } catch { /* ignore */ }
    setLoading(false)
  }, [page])

  useEffect(() => { load() }, [load])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="page-container">
      <div><h1 className="text-3xl font-heading font-bold text-theme-text">Payments</h1><p className="text-theme-text opacity-50 mt-1">{total} total transactions</p></div>
      <Card>
        <div className="flex gap-4 mb-6">
          <Input placeholder="Search payments..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full md:max-w-sm" />
          <Button variant="primary" onClick={load} disabled={loading}>{loading ? 'Refreshing...' : 'Refresh'}</Button>
        </div>
        {loading ? (
          <div className="text-center py-12 text-theme-text opacity-50">Loading...</div>
        ) : payments.length === 0 ? (
          <div className="text-center py-12 text-theme-text opacity-50">No payments found.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-theme">
                  <th className="table-header table-col-priority-1">Payment ID</th>
                  <th className="table-header table-col-priority-2">Guest</th>
                  <th className="table-header table-col-priority-3">Method</th>
                  <th className="table-header table-col-priority-1">Amount</th>
                  <th className="table-header table-col-priority-4">Reference</th>
                  <th className="table-header table-col-priority-2">Status</th>
                  <th className="table-header table-col-priority-4">Date</th>
                </tr></thead>
                <tbody>
                  {payments.map((p: any) => (
                    <tr key={p.id} className="border-b border-theme hover:bg-theme-surface transition-colors">
                      <td className="py-3 text-gold-500 font-medium">{p.paymentNumber || `PAY-${String(p.id).padStart(6, '0')}`}</td>
                      <td className="py-3 text-theme-text">{p.reservation?.guest?.firstName || p.guestId || '—'}</td>
                      <td className="py-3 text-theme-text opacity-70">{p.method}</td>
                      <td className="py-3 text-theme-text opacity-70">{p.amount ? formatCurrency(p.amount) : '—'}</td>
                      <td className="py-3 text-theme-text opacity-50 text-xs">{p.transactionRef || '—'}</td>
                      <td className="py-3"><Badge variant={p.status === 'COMPLETED' ? 'success' : p.status === 'PENDING' ? 'gold' : 'danger'}>{p.status}</Badge></td>
                      <td className="py-3 text-theme-text opacity-70">{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—'}</td>
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
    </div>
  )
}
