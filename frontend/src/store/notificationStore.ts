import { create } from 'zustand'
import { cmsApi } from '@/services/publicApi'

export interface NotificationItem {
  id: string
  type: string
  title: string
  description: string
  createdAt: string
  read: boolean
}

interface NotificationState {
  notifications: NotificationItem[]
  unread: number
  readIds: Set<string>
  deletedIds: Set<string>
  loading: boolean
  fetch: () => Promise<void>
  markRead: (id: string) => void
  markAllRead: () => void
  deleteNotif: (id: string) => void
  lastNotifIds: string[]
  pollInterval: ReturnType<typeof setInterval> | null
  startPolling: () => void
  stopPolling: () => void
}

function loadReadIds(): Set<string> {
  try {
    const raw = localStorage.getItem('notifReadIds')
    return new Set<string>(raw ? JSON.parse(raw) : [])
  } catch { return new Set<string>() }
}

function loadDeletedIds(): Set<string> {
  try {
    const raw = localStorage.getItem('notifDeletedIds')
    return new Set<string>(raw ? JSON.parse(raw) : [])
  } catch { return new Set<string>() }
}

function saveReadIds(ids: Set<string>) {
  localStorage.setItem('notifReadIds', JSON.stringify([...ids]))
}

function saveDeletedIds(ids: Set<string>) {
  localStorage.setItem('notifDeletedIds', JSON.stringify([...ids]))
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unread: 0,
  readIds: loadReadIds(),
  deletedIds: loadDeletedIds(),
  loading: false,
  lastNotifIds: [],
  pollInterval: null,

  fetch: async () => {
    try {
      const data = await cmsApi.getNotifications()
      const allNotifs: NotificationItem[] = data.notifications || []
      const readIds = get().readIds
      const deletedIds = get().deletedIds
      const prevIds = get().lastNotifIds

      const notifs = allNotifs.filter(n => !deletedIds.has(n.id))
      const currentIds = notifs.map(n => n.id)

      // Check for new notifications (for browser push)
      if (prevIds.length > 0 && Notification.permission === 'granted') {
        const newOnes = notifs.filter(n => !prevIds.includes(n.id))
        newOnes.forEach(n => {
          try {
            new Notification('The Yads Hood Hotel', {
              body: n.title,
              icon: '/favicon.ico',
            })
          } catch {}
        })
      }

      const unreadCount = notifs.filter(n => !readIds.has(n.id)).length

      set({
        notifications: notifs,
        unread: unreadCount,
        lastNotifIds: currentIds,
        loading: false,
      })
    } catch {
      set({ loading: false })
    }
  },

  markRead: (id: string) => {
    const readIds = new Set(get().readIds)
    readIds.add(id)
    saveReadIds(readIds)
    const unreadCount = get().notifications.filter(n => !readIds.has(n.id)).length
    set({ readIds, unread: unreadCount })
  },

  markAllRead: () => {
    const readIds = new Set(get().notifications.map(n => n.id))
    saveReadIds(readIds)
    set({ readIds, unread: 0 })
  },

  deleteNotif: (id: string) => {
    const deletedIds = new Set(get().deletedIds)
    deletedIds.add(id)
    saveDeletedIds(deletedIds)
    const notifs = get().notifications.filter(n => n.id !== id)
    const readIds = get().readIds
    readIds.delete(id)
    saveReadIds(readIds)
    const unreadCount = notifs.filter(n => !readIds.has(n.id)).length
    set({ notifications: notifs, deletedIds, unread: unreadCount })
  },

  startPolling: () => {
    get().stopPolling()
    get().fetch()
    const interval = setInterval(() => get().fetch(), 30000)
    set({ pollInterval: interval })
  },

  stopPolling: () => {
    const interval = get().pollInterval
    if (interval) {
      clearInterval(interval)
      set({ pollInterval: null })
    }
  },
}))
