import { useState, useEffect } from 'react'
import { Bell, Utensils, BedDouble, Mail, CheckCircle2, Wrench, UtensilsCrossed, LogIn, LogOut, CheckCheck, Trash2, MessageCircle, FileText, Sparkles } from 'lucide-react'
import { Card, CardTitle } from '@/components/ui/card'
import Button from '@/components/ui/button'
import { useNotificationStore, type NotificationItem } from '@/store/notificationStore'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { ContactSubmissions, RestaurantOrdersEditor } from '@/features/cms/pages/CmsPage'

const typeIcons: Record<string, React.ReactNode> = {
  message:      <Mail size={20} />,
  order:        <Utensils size={20} />,
  reservation:  <BedDouble size={20} />,
  housekeeping: <CheckCircle2 size={20} />,
  maintenance:  <Wrench size={20} />,
  kitchen:      <UtensilsCrossed size={20} />,
  check_in:     <LogIn size={20} />,
  check_out:    <LogOut size={20} />,
  event_booking: <Sparkles size={20} />,
}

const typeColors: Record<string, string> = {
  message:      'bg-blue-500/20 text-blue-400',
  order:        'bg-orange-500/20 text-orange-400',
  reservation:  'bg-green-500/20 text-green-400',
  housekeeping: 'bg-cyan-500/20 text-cyan-400',
  maintenance:  'bg-yellow-500/20 text-yellow-400',
  kitchen:      'bg-red-500/20 text-red-400',
  check_in:     'bg-emerald-500/20 text-emerald-400',
  check_out:    'bg-purple-500/20 text-purple-400',
  event_booking: 'bg-pink-500/20 text-pink-400',
}

function navigateTo(n: NotificationItem, nav: ReturnType<typeof useNavigate>) {
  if (n.type === 'reservation' || n.type === 'check_in' || n.type === 'check_out') nav('/admin/reservations')
  else if (n.type === 'housekeeping') nav('/admin/housekeeping')
  else if (n.type === 'maintenance') nav('/admin/maintenance')
  else if (n.type === 'event_booking') nav('/admin/events')
}

type NotifTab = 'notifications' | 'messages' | 'orders'

export default function NotificationsPage() {
  const { notifications, unread, readIds, loading, fetch: fetchNotifs, markRead, markAllRead, deleteNotif } = useNotificationStore()
  const [activeTab, setActiveTab] = useState<NotifTab>('notifications')
  const navigate = useNavigate()
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => { fetchNotifs() }, [fetchNotifs])

  const handleClick = (n: NotificationItem) => {
    markRead(n.id)
    if (n.type === 'message') setActiveTab('messages')
    else if (n.type === 'order' || n.type === 'kitchen') setActiveTab('orders')
    else navigateTo(n, navigate)
  }

  if (loading && notifications.length === 0 && activeTab === 'notifications') return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-[14px] shadow-xl text-theme-text font-medium ${
          toast.type === 'success' ? 'bg-success' : 'bg-danger'
        }`}>
          {toast.message}
        </div>
      )}

      <div>
        <h1 className="text-3xl font-heading font-bold text-theme-text">Activity Center</h1>
        <p className="text-theme-text opacity-50 mt-1">Notifications, messages, and orders</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { key: 'notifications' as NotifTab, icon: Bell, label: `Notifications (${unread})` },
          { key: 'messages' as NotifTab, icon: MessageCircle, label: 'Messages' },
          { key: 'orders' as NotifTab, icon: FileText, label: 'Orders' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-[14px] font-medium transition-all duration-300 whitespace-nowrap text-sm ${
              activeTab === t.key
                ? 'bg-gold-500 text-forest-950'
                : 'bg-theme-surface/50 text-theme-text opacity-60 hover:bg-theme-accent/10 hover:text-theme-accent hover:opacity-100'
            }`}
          >
            <t.icon size={16} />
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'notifications' && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-theme-text opacity-50 text-sm">{notifications.length} total</p>
            </div>
            <div className="flex items-center gap-3">
              {unread > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllRead}>
                  <CheckCheck size={16} /> Mark all read
                </Button>
              )}
            </div>
          </div>

          {notifications.length === 0 ? (
            <Card>
              <div className="text-center py-16">
                <Bell size={48} className="mx-auto text-theme-text opacity-20 mb-4" />
                <p className="text-theme-text opacity-50">No notifications yet.</p>
              </div>
            </Card>
          ) : (
            <div className="space-y-2">
              {notifications.filter(n => !readIds.has(n.id)).map((n) => (
                <NotifCard key={n.id} notification={n} isRead={false} onClick={() => handleClick(n)} onDelete={() => deleteNotif(n.id)} />
              ))}
              {notifications.filter(n => readIds.has(n.id)).map((n) => (
                <NotifCard key={n.id} notification={n} isRead={true} onClick={() => handleClick(n)} onDelete={() => deleteNotif(n.id)} />
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'messages' && <ContactSubmissions showToast={showToast} />}
      {activeTab === 'orders' && <RestaurantOrdersEditor showToast={showToast} />}
    </div>
  )
}

function NotifCard({ notification: n, isRead, onClick, onDelete }: {
  notification: NotificationItem
  isRead: boolean
  onClick: () => void
  onDelete: () => void
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-start gap-4 p-4 rounded-[14px] border transition-all duration-300 cursor-pointer',
        isRead
          ? 'bg-theme-surface/40 border-theme/50 opacity-60 hover:opacity-80'
          : 'bg-theme-surface border-theme hover:bg-theme-surface/80',
      )}
    >
      <div className={cn(
        'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
        isRead ? 'bg-theme-surface/60 text-theme-text/40' : typeColors[n.type] || 'bg-theme-surface',
      )}>
        {isRead ? <Bell size={16} /> : (typeIcons[n.type] || <Bell size={18} />)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={cn('text-sm', isRead ? 'text-theme-text/50' : 'text-theme-text font-medium')}>{n.title}</p>
          {!isRead && <span className="w-2 h-2 rounded-full bg-gold-500 flex-shrink-0" />}
        </div>
        <p className={cn('text-xs mt-0.5 line-clamp-1', isRead ? 'text-theme-text/30' : 'text-theme-text/50')}>{n.description}</p>
        <p className="text-theme-text/20 text-[10px] mt-1">{new Date(n.createdAt).toLocaleString()}</p>
      </div>
      <button onClick={(e) => { e.stopPropagation(); onDelete() }} className="p-1.5 rounded-lg hover:bg-danger/20 text-theme-text/40 hover:text-danger transition-colors self-center flex-shrink-0" title="Delete">
        <Trash2 size={14} />
      </button>
    </div>
  )
}
