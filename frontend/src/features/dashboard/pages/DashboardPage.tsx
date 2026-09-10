import { useState, useEffect } from 'react'
import { TrendingUp, Users, BedDouble, UtensilsCrossed, CalendarCheck, Bell, CheckCircle2, Clock, Wrench, Mail, LogIn, LogOut, Utensils } from 'lucide-react'
import { Card, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Button from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { formatCurrency } from '@/lib/utils'
import { useNotificationStore } from '@/store/notificationStore'
import api from '@/services/api'

const statusVariant = (status: string) => {
  const s = status?.toLowerCase() || ''
  if (s === 'checked_in' || s === 'checked in' || s === 'occupied') return 'info' as const
  if (s === 'confirmed') return 'success' as const
  if (s === 'pending') return 'gold' as const
  if (s === 'cancelled') return 'danger' as const
  return 'default' as const
}

const formatResStatus = (s: string) => {
  if (!s) return '—'
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function DashboardPage() {
  const [revenue, setRevenue] = useState<any>(null)
  const [occupancy, setOccupancy] = useState<any>(null)
  const [restaurant, setRestaurant] = useState<any>(null)
  const [roomStats, setRoomStats] = useState<any>(null)
  const [reservations, setReservations] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [housekeeping, setHousekeeping] = useState<any[]>([])
  const [maintenance, setMaintenance] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { deletedIds } = useNotificationStore()

  useEffect(() => {
    Promise.all([
      api.get('/reports/revenue').then(r => r.data).catch(() => null),
      api.get('/reports/occupancy').then(r => r.data).catch(() => null),
      api.get('/reports/restaurant').then(r => r.data).catch(() => null),
      api.get('/rooms/availability').then(r => r.data).catch(() => null),
      api.get('/reservations?limit=5&page=1').then(r => r.data).catch(() => ({ data: [] })),
      api.get('/cms/notifications').then(r => r.data).catch(() => ({ notifications: [] })),
      api.get('/housekeeping/tasks?limit=5&page=1').then(r => r.data).catch(() => ({ data: [] })),
      api.get('/maintenance?limit=5&page=1').then(r => r.data).catch(() => ({ data: [] })),
    ]).then(([rev, occ, rest, rooms, reses, notifs, hk, maint]) => {
      setRevenue(rev)
      setOccupancy(occ)
      setRestaurant(rest)
      setRoomStats(rooms?.stats || rooms)
      setReservations(reses?.data || [])
      setNotifications((notifs?.notifications || []).filter((n: any) => !deletedIds.has(n.id)))
      setHousekeeping(hk?.data || [])
      setMaintenance(maint?.data || [])
    }).finally(() => setLoading(false))
  }, [])

  const todayGuests = reservations.filter((r: any) => {
    if (!r.checkIn) return false
    const today = new Date().toDateString()
    return new Date(r.checkIn).toDateString() === today
  }).length

  const totalRooms = roomStats ? (roomStats.available || 0) + (roomStats.occupied || 0) + (roomStats.reserved || 0) + (roomStats.cleaning || 0) + (roomStats.maintenance || 0) : 0

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const kpis = [
    { icon: TrendingUp, label: 'Revenue', value: revenue ? `KSh ${formatCurrency(revenue.totalRevenue)}`.replace('KSh KSh', 'KSh') : 'KSh 0', trend: revenue ? `${revenue.totalTransactions} transactions` : '—', color: 'text-success' },
    { icon: BedDouble, label: 'Occupancy', value: occupancy ? `${Math.round(occupancy.occupancyRate * 100)}%` : '0%', trend: occupancy ? `${occupancy.occupied}/${occupancy.totalRooms}` : '—', color: 'text-gold-500' },
    { icon: Users, label: "Today's Guests", value: `${todayGuests} Guest${todayGuests !== 1 ? 's' : ''}`, trend: roomStats ? `${roomStats.occupied || 0} rooms occupied` : '—', color: 'text-info' },
    { icon: UtensilsCrossed, label: 'Restaurant Sales', value: restaurant ? `KSh ${formatCurrency(restaurant.totalSales)}`.replace('KSh KSh', 'KSh') : 'KSh 0', trend: restaurant ? `${restaurant.totalOrders} orders` : '—', color: 'text-success' },
  ]

  return (
    <div className="page-container">
      <div>
        <h1 className="text-3xl font-heading font-bold text-theme-text">Dashboard</h1>
        <p className="text-theme-text opacity-50 mt-1">Welcome back! Here's your hotel overview.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="hover:shadow-xl">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-gold-500/20 flex items-center justify-center">
                <kpi.icon size={24} className="text-gold-500" />
              </div>
              <span className={`text-sm font-medium ${kpi.color}`}>{kpi.trend}</span>
            </div>
            <p className="text-theme-text opacity-60 text-sm mb-1">{kpi.label}</p>
            <p className="text-2xl font-bold text-theme-text">{kpi.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardTitle>Revenue Trend</CardTitle>
          <div className="h-64 flex items-center justify-center text-theme-text opacity-30">
            <div className="text-center">
              <TrendingUp size={48} className="mx-auto mb-2 opacity-30" />
              <p>Revenue chart will render here</p>
              {revenue && <p className="text-sm mt-2 opacity-70">Total: KSh {formatCurrency(revenue.totalRevenue)}</p>}
            </div>
          </div>
        </Card>
        <Card>
          <CardTitle>Room Status</CardTitle>
          <div className="space-y-4 mt-4">
            {[
              { label: 'Available', count: roomStats?.available || 0, color: 'bg-success' },
              { label: 'Occupied', count: roomStats?.occupied || 0, color: 'bg-danger' },
              { label: 'Reserved', count: roomStats?.reserved || 0, color: 'bg-gold-500' },
              { label: 'Cleaning', count: roomStats?.cleaning || 0, color: 'bg-info' },
              { label: 'Maintenance', count: roomStats?.maintenance || 0, color: 'bg-warning' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="text-sm text-theme-text opacity-70">{item.label}</span>
                </div>
                <span className="text-sm text-theme-text font-bold">{item.count}</span>
              </div>
            ))}
            <div className="pt-2 border-t border-theme flex justify-between text-sm">
              <span className="text-theme-text opacity-50">Total</span>
              <span className="text-theme-text font-bold">{totalRooms}</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <CardTitle>Recent Reservations</CardTitle>
            <Link to="/admin/reservations" className="text-sm text-gold-500 hover:underline">View All</Link>
          </div>
          {reservations.length === 0 ? (
            <p className="text-theme-text opacity-40 text-center py-8">No reservations yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-theme">
                    <th className="table-header table-col-priority-1">Guest</th>
                    <th className="table-header table-col-priority-2">Room</th>
                    <th className="table-header table-col-priority-3">Check-in</th>
                    <th className="table-header table-col-priority-3">Amount</th>
                    <th className="table-header table-col-priority-1">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map((res: any) => (
                    <tr key={res.id} className="border-b border-theme hover:bg-theme-surface transition-colors">
                      <td className="table-cell table-col-priority-1">{res.guest?.firstName} {res.guest?.lastName}</td>
                      <td className="table-cell table-col-priority-2">{res.room?.roomNumber || '—'}</td>
                      <td className="table-cell table-col-priority-3">{res.checkIn ? new Date(res.checkIn).toLocaleDateString() : '—'}</td>
                      <td className="table-cell table-col-priority-3">{res.totalAmount ? formatCurrency(res.totalAmount) : '—'}</td>
                      <td className="table-cell table-col-priority-1"><Badge variant={statusVariant(res.status)}>{formatResStatus(res.status)}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
        <Card>
          <CardTitle className="mb-4">Today's Tasks</CardTitle>
          <div className="space-y-3">
            {housekeeping.length === 0 && maintenance.length === 0 ? (
              <p className="text-theme-text opacity-40 text-center py-8 text-sm">No pending tasks.</p>
            ) : (
              <>
                {housekeeping.slice(0, 3).map((t: any) => (
                  <div key={`hk-${t.id}`} className="flex items-center justify-between p-3 rounded-[14px] bg-theme-surface">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-info" />
                      <span className="text-sm text-theme-text opacity-80">{t.room?.roomNumber ? `Clean Room ${t.room.roomNumber}` : 'Housekeeping task'}</span>
                    </div>
                    <Badge variant={t.priority === 'HIGH' ? 'danger' : 'warning'}>{t.priority || 'Medium'}</Badge>
                  </div>
                ))}
                {maintenance.slice(0, 2).map((t: any) => (
                  <div key={`mnt-${t.id}`} className="flex items-center justify-between p-3 rounded-[14px] bg-theme-surface">
                    <div className="flex items-center gap-2">
                      <Wrench size={14} className="text-warning" />
                      <span className="text-sm text-theme-text opacity-80">{t.description?.substring(0, 30) || 'Maintenance'}</span>
                    </div>
                    <Badge variant="danger">{t.priority === 'HIGH' ? 'High' : 'Medium'}</Badge>
                  </div>
                ))}
              </>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardTitle className="mb-4">Activity Timeline</CardTitle>
          {notifications.length === 0 ? (
            <p className="text-theme-text opacity-40 text-center py-8 text-sm">No recent activity.</p>
          ) : (
            <div className="space-y-3">
              {notifications.slice(0, 6).map((n: any) => {
                const iconMap: Record<string, { icon: any; color: string }> = {
                  message:      { icon: Mail, color: 'bg-blue-500/20 text-blue-400' },
                  order:        { icon: Utensils, color: 'bg-orange-500/20 text-orange-400' },
                  reservation:  { icon: BedDouble, color: 'bg-green-500/20 text-green-400' },
                  housekeeping: { icon: CheckCircle2, color: 'bg-cyan-500/20 text-cyan-400' },
                  maintenance:  { icon: Wrench, color: 'bg-yellow-500/20 text-yellow-400' },
                  kitchen:      { icon: UtensilsCrossed, color: 'bg-red-500/20 text-red-400' },
                  check_in:     { icon: LogIn, color: 'bg-emerald-500/20 text-emerald-400' },
                  check_out:    { icon: LogOut, color: 'bg-purple-500/20 text-purple-400' },
                }
                const cfg = iconMap[n.type] || { icon: Bell, color: 'bg-gold-500/20 text-gold-500' }
                const Icon = cfg.icon
                return (
                  <div key={n.id} className="flex items-start gap-3 p-2 rounded-[10px] hover:bg-theme-surface transition-colors">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
                      <Icon size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-theme-text opacity-40">{new Date(n.createdAt).toLocaleTimeString()}</p>
                      <p className="text-sm text-theme-text opacity-80 leading-tight">{n.title}</p>
                      {n.description && <p className="text-xs text-theme-text opacity-50 mt-0.5">{n.description}</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
        <Card className="lg:col-span-2">
          <CardTitle className="mb-4">Quick Actions</CardTitle>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { label: 'New Booking', icon: CalendarCheck, path: '/admin/reservations' },
              { label: 'Check-In', icon: Users, path: '/admin/reservations' },
              { label: 'Check-Out', icon: Users, path: '/admin/reservations' },
              { label: 'Restaurant Order', icon: UtensilsCrossed, path: '/admin/restaurant' },
              { label: 'Record Payment', icon: TrendingUp, path: '/admin/payments' },
              { label: 'Maintenance', icon: Bell, path: '/admin/maintenance' },
            ].map((action) => (
              <Link key={action.label} to={action.path}>
                <div className="flex flex-col items-center justify-center h-[90px] rounded-[14px] bg-theme-surface hover:bg-gold-500/10 border border-theme hover:border-gold-500/30 transition-all duration-300 cursor-pointer">
                  <action.icon size={24} className="text-gold-500 mb-2" />
                  <span className="text-xs text-theme-text opacity-70">{action.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
