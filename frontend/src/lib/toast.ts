type ToastType = 'success' | 'error'

const listeners: Set<(message: string, type: ToastType) => void> = new Set()

export function showToast(message: string, type: ToastType = 'success') {
  listeners.forEach(fn => fn(message, type))
  if (listeners.size === 0) {
    const el = document.createElement('div')
    el.style.cssText = `position:fixed;bottom:24px;right:24px;z-index:9999;padding:12px 24px;border-radius:14px;font-size:14px;font-weight:500;color:#fff;background:${type === 'success' ? '#16a34a' : '#dc2626'};box-shadow:0 8px 32px rgba(0,0,0,0.3);transition:all 0.3s ease;max-width:400px`
    el.textContent = message
    document.body.appendChild(el)
    setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 300) }, 2500)
  }
}

export function onToast(fn: (message: string, type: ToastType) => void) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
