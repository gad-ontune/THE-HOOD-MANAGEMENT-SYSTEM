import { useState } from 'react'
import { Card, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Button from '@/components/ui/button'
import { TrendingUp, BedDouble, UtensilsCrossed, Package } from 'lucide-react'
import { showToast } from '@/lib/toast'

const reports = [
  { icon: TrendingUp, label: 'Revenue Report', desc: 'View revenue, expenses, and profit analysis', color: 'text-success' },
  { icon: BedDouble, label: 'Occupancy Report', desc: 'Room occupancy rates and trends', color: 'text-gold-500' },
  { icon: UtensilsCrossed, label: 'Restaurant Report', desc: 'Sales, popular items, and peak hours', color: 'text-info' },
  { icon: Package, label: 'Inventory Report', desc: 'Stock levels, usage, and supplier performance', color: 'text-warning' },
]

export default function ReportsPage() {
  const [loadingLabel, setLoadingLabel] = useState<string | null>(null)

  const handleAction = async (label: string, format: string) => {
    setLoadingLabel(`${label}-${format}`)
    await new Promise(r => setTimeout(r, 800))
    setLoadingLabel(null)
    showToast(`${label} — ${format.toUpperCase()} generated`, 'success')
  }

  return (
    <div className="page-container">
      <div><h1 className="text-3xl font-heading font-bold text-theme-text">Reports</h1><p className="text-theme-text opacity-50 mt-1">Business intelligence and operational analytics</p></div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-6">
        {reports.map((report) => {
          const loading = loadingLabel?.startsWith(report.label)
          return (
            <Card key={report.label} className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-gold-500/20 flex items-center justify-center flex-shrink-0">
                <report.icon size={28} className={report.color} />
              </div>
              <div className="flex-1">
                <CardTitle className="mb-2">{report.label}</CardTitle>
                <p className="text-theme-text opacity-60 text-sm mb-4">{report.desc}</p>
                <div className="flex gap-2">
                  <Button variant="primary" size="sm" onClick={() => handleAction(report.label, 'view')} disabled={loading}>{loading && loadingLabel === `${report.label}-view` ? 'Loading...' : 'View'}</Button>
                  <Button variant="secondary" size="sm" onClick={() => handleAction(report.label, 'pdf')} disabled={loading}>{loading && loadingLabel === `${report.label}-pdf` ? 'Generating...' : 'PDF'}</Button>
                  <Button variant="ghost" size="sm" onClick={() => handleAction(report.label, 'excel')} disabled={loading}>{loading && loadingLabel === `${report.label}-excel` ? 'Exporting...' : 'Excel'}</Button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardTitle className="mb-4">Quick Stats</CardTitle>
        <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-6 text-center">
          {[
            { label: 'This Month Revenue', value: 'KSh 2,350,000' },
            { label: 'Avg Occupancy', value: '87%' },
            { label: 'Total Bookings', value: '143' },
            { label: 'Avg Stay', value: '2.4 Nights' },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-theme-text opacity-50 text-sm mb-1">{s.label}</p>
              <p className="text-xl font-bold text-theme-text">{s.value}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
