import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Bell, Search, LogOut, Menu,
  Hotel, CalendarCheck, Users, BedDouble, CreditCard,
  UtensilsCrossed, Package, Sparkles, Wrench, UserCircle,
  BarChart3, Globe, Settings,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { useNotificationStore } from '@/store/notificationStore'
import { cn } from '@/lib/utils'
import ThemeSelector from '@/components/ThemeSelector'

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Bell, label: 'Notifications', path: '/admin/notifications', isNotif: true },
  { icon: CalendarCheck, label: 'Reservations', path: '/admin/reservations' },
  { icon: Users, label: 'Guests', path: '/admin/guests' },
  { icon: BedDouble, label: 'Rooms', path: '/admin/rooms' },
  { icon: CreditCard, label: 'Payments', path: '/admin/payments' },
  { icon: UtensilsCrossed, label: 'Restaurant', path: '/admin/restaurant' },
  { icon: Sparkles, label: 'Events', path: '/admin/events' },
  { icon: Package, label: 'Inventory', path: '/admin/inventory' },
  { icon: Hotel, label: 'Housekeeping', path: '/admin/housekeeping' },
  { icon: Wrench, label: 'Maintenance', path: '/admin/maintenance' },
  { icon: UserCircle, label: 'Employees', path: '/admin/employees' },
  { icon: BarChart3, label: 'Reports', path: '/admin/reports' },
  { icon: Globe, label: 'Website CMS', path: '/admin/cms' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
]

export default function AdminLayout() {
  const { sidebarOpen, toggleSidebar } = useUIStore()
  const { user, logout } = useAuthStore()
  const { unread, startPolling, stopPolling } = useNotificationStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileSidebar, setMobileSidebar] = useState(false)

  useEffect(() => {
    if (location.pathname !== '/admin/change-password' && user?.mustChangePassword) {
      navigate('/admin/change-password', { replace: true })
    }
  }, [user?.mustChangePassword, location.pathname, navigate])

  useEffect(() => {
    startPolling()
    return () => stopPolling()
  }, [startPolling, stopPolling])

  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  useEffect(() => {
    setMobileSidebar(false)
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const SidebarContent = ({ collapsed }: { collapsed: boolean }) => (
    <>
      <div className="h-14 lg:h-16 flex items-center justify-center border-b border-theme shrink-0">
        {collapsed ? (
          <span className="text-xl font-heading font-bold text-gold-500">H</span>
        ) : (
          <Link to="/admin" className="flex items-center gap-2">
            <span className="text-base lg:text-lg font-heading font-bold text-gold-500">The Yads Hood</span>
            <span className="text-xs text-theme-muted">Admin</span>
          </Link>
        )}
      </div>
      <nav className="flex flex-1 flex-col overflow-y-auto">
        {sidebarItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              'flex flex-1 items-center gap-3 min-h-8 rounded-[12px] px-3 text-theme-muted hover:text-theme-accent hover:shadow-[0_0_20px_rgba(212,175,55,0.15)] hover:bg-theme-accent/10 transition-all duration-200 group relative',
              location.pathname === item.path && 'bg-theme-primary text-white shadow-md',
            )}
          >
            <item.icon size={18} className="text-gold-500 flex-shrink-0" />
            {!collapsed && <span className="text-xs lg:text-sm font-medium">{item.label}</span>}
            {item.isNotif && unread > 0 && (
              <span className={cn(
                'bg-theme-accent text-black text-[10px] font-bold rounded-full flex items-center justify-center',
                collapsed ? 'absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1' : 'ml-auto min-w-5 h-5 px-1.5',
              )}>
                {unread}
              </span>
            )}
          </Link>
        ))}
      </nav>
      <div className="p-2 border-t border-theme shrink-0">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 h-9 lg:h-10 w-full rounded-[12px] px-3 text-theme-muted hover:text-danger transition-colors duration-200"
        >
          <LogOut size={18} />
          {!collapsed && <span className="text-xs lg:text-sm font-medium">Logout</span>}
        </button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-theme-bg flex">
      {mobileSidebar && (
        <div className="sidebar-overlay" onClick={() => setMobileSidebar(false)} />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 h-full z-40 bg-theme-primary-dark border-r border-theme transition-all duration-300 flex flex-col',
          mobileSidebar ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen',
          sidebarOpen ? 'lg:w-[280px]' : 'lg:w-[88px]',
        )}
      >
        <SidebarContent collapsed={!sidebarOpen} />
      </aside>

      <div
        className={cn(
          'flex-1 transition-all duration-300 min-w-0',
        )}
      >
        <header className="h-16 lg:h-20 bg-theme-primary-dark border-b border-theme flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-2 lg:gap-4 min-w-0">
            <button
              onClick={() => setMobileSidebar(true)}
              className="lg:hidden text-theme-muted hover:text-theme-text p-2"
            >
              <Menu size={20} />
            </button>
            <button
              onClick={toggleSidebar}
              className="hidden lg:flex text-theme-muted hover:text-theme-text p-2"
            >
              <Menu size={20} />
            </button>
            <div className="hidden md:flex items-center gap-2 bg-theme-primary-darkest rounded-[14px] px-4 h-10 lg:h-12 w-48 lg:w-80 border border-theme">
              <Search size={16} className="text-theme-muted shrink-0" />
              <input
                placeholder="Search guests, reservations..."
                className="bg-transparent border-none outline-none text-xs lg:text-sm text-theme-text w-full placeholder:text-theme-muted"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 lg:gap-4">
            <a href="/" target="_blank" rel="noopener noreferrer" className="hidden md:flex items-center gap-1.5 px-2 lg:px-3 py-2 rounded-[14px] text-theme-muted hover:text-theme-accent hover:bg-theme-accent/10 transition-all duration-300 text-xs lg:text-sm font-medium">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              View Site
            </a>
            <ThemeSelector />
            <div className="hidden sm:flex items-center gap-2 px-2 lg:px-3 py-1 lg:py-1.5 bg-theme-surface rounded-full">
              <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-success animate-pulse" />
              <span className="text-[10px] lg:text-xs text-theme-muted">Online</span>
            </div>
            <button onClick={() => navigate('/admin/notifications')} className="relative text-theme-muted hover:text-theme-text p-1">
              <Bell size={20} />
              {unread > 0 && <span className="absolute -top-1 -right-1 min-w-3.5 h-3.5 lg:min-w-4 lg:h-4 px-0.5 bg-theme-accent rounded-full text-[9px] lg:text-[10px] flex items-center justify-center text-black font-bold">{unread}</span>}
            </button>
            <div className="flex items-center gap-2 lg:gap-3 border-l border-theme pl-2 lg:pl-4 min-w-0">
              <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-theme-accent/20 flex items-center justify-center text-theme-accent font-bold text-xs lg:text-sm shrink-0">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="hidden lg:block min-w-0">
                <p className="text-sm font-medium text-theme-text truncate">{user?.name || 'Admin'}</p>
                <p className="text-xs text-theme-muted capitalize truncate">{user?.role || 'Staff'}</p>
              </div>
            </div>
          </div>
        </header>
        <main className="p-3 md:p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
