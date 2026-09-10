import { useState, useEffect } from 'react'
import { X, Clock, Flame, Utensils } from 'lucide-react'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import PhoneInput from '@/components/ui/phone-input'
import { Card, CardTitle } from '@/components/ui/card'
import { publicApi } from '@/services/publicApi'
import { formatCurrency } from '@/lib/utils'

export default function RestaurantPage() {
  const [menu, setMenu] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showReserve, setShowReserve] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [reserveForm, setReserveForm] = useState({ name: '', phone: '', email: '', date: '', time: '', guests: 2, notes: '' })
  const [reserving, setReserving] = useState(false)
  const [reserved, setReserved] = useState(false)

  useEffect(() => {
    publicApi.getMenu().then(setMenu).finally(() => setLoading(false))
  }, [])

  const [payInfo, setPayInfo] = useState<any>(null)

  const handleReserve = async () => {
    setReserving(true)
    try {
      const result = await publicApi.reserveTable(reserveForm)
      setPayInfo(result)
      setReserved(true)
    } catch { alert('Failed to reserve. Please try again.') }
    setReserving(false)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div>
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/hero-bg.png')" }} />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-heading font-bold text-theme-text mb-4">Restaurant</h1>
          <p className="text-lg text-cream/70">Experience fine dining at The Yads Hood Hotel</p>
        </div>
      </section>

      <section className="py-16 px-6 lg:px-20 xl:px-32 max-w-[1600px] mx-auto">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl xl:text-5xl font-heading font-bold text-theme-text mb-4">About Our Restaurant</h2>
          <p className="text-theme-text opacity-60 xl:text-lg">Our restaurant offers a delightful blend of local Kenyan cuisine and international favorites.</p>
        </div>

        {menu.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-theme-text opacity-50 text-lg xl:text-xl">Menu coming soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-12">
            {menu.map((cat: any) => (
              <div key={cat.category}>
                <h3 className="text-2xl xl:text-3xl font-heading font-bold text-gold-500 mb-6">{cat.category}</h3>
                <div className="space-y-4">
                  {cat.items.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-4 py-3 border-b border-theme cursor-pointer hover:bg-theme-surface/30 rounded-lg px-2 transition-colors" onClick={() => setSelectedItem(item)}>
                      {item.image && (
                        <img src={item.image} alt={item.name} className="w-16 h-16 xl:w-20 xl:h-20 rounded-xl object-cover flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-theme-text font-medium xl:text-lg">{item.name}</p>
                        {item.description && <p className="text-xs xl:text-sm text-theme-text opacity-40 truncate">{item.description}</p>}
                      </div>
                      <span className="text-gold-500 font-bold whitespace-nowrap xl:text-lg">{formatCurrency(item.price)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-16">
          <Button variant="primary" size="lg" className="xl:text-xl xl:px-10" onClick={() => setShowReserve(true)}>Reserve a Table</Button>
        </div>
      </section>

      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelectedItem(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[22px] w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="relative h-56 overflow-hidden rounded-t-[22px]">
              <img src={selectedItem.image || '/hero-bg.png'} alt={selectedItem.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <button onClick={() => setSelectedItem(null)} className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 rounded-full p-2 text-white"><X size={20} /></button>
              <div className="absolute bottom-4 left-6">
                <h3 className="text-2xl font-heading font-bold text-white">{selectedItem.name}</h3>
                <span className="text-gold-500 text-lg font-bold">{formatCurrency(selectedItem.price)}</span>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <p className="text-white/70 text-sm leading-relaxed">{selectedItem.description || 'No description available.'}</p>
              <div className="grid grid-cols-3 gap-3">
                {selectedItem.preparationTime && (
                  <div className="text-center p-3 rounded-xl bg-white/5">
                    <Clock size={18} className="mx-auto text-gold-500 mb-1" />
                    <p className="text-white/60 text-xs">{selectedItem.preparationTime} min</p>
                  </div>
                )}
                {selectedItem.calories && (
                  <div className="text-center p-3 rounded-xl bg-white/5">
                    <Flame size={18} className="mx-auto text-gold-500 mb-1" />
                    <p className="text-white/60 text-xs">{selectedItem.calories} cal</p>
                  </div>
                )}
                <div className="text-center p-3 rounded-xl bg-white/5">
                  <Utensils size={18} className="mx-auto text-gold-500 mb-1" />
                  <p className="text-white/60 text-xs">Available</p>
                </div>
              </div>
              {selectedItem.ingredients && (
                <div>
                  <h4 className="text-white text-sm font-semibold mb-2">Ingredients</h4>
                  <p className="text-white/50 text-xs leading-relaxed">{selectedItem.ingredients}</p>
                </div>
              )}
              <Button variant="primary" className="w-full" onClick={() => { setSelectedItem(null); setShowReserve(true) }}>Order This Dish</Button>
            </div>
          </div>
        </div>
      )}

      {showReserve && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => { if (!reserved) setShowReserve(false) }}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[22px] p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => { setShowReserve(false); setReserved(false) }} className="absolute top-4 right-4 text-white/60 hover:text-white"><X size={24} /></button>
            <h3 className="text-2xl font-heading font-bold text-white mb-6">Reserve a Table</h3>
            {reserved ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-gold-500/20 flex items-center justify-center mx-auto mb-4"><Utensils size={32} className="text-gold-500" /></div>
                <p className="text-white text-lg font-semibold mb-2">Reservation Created!</p>
                <p className="text-white/60 text-sm mb-4">Secure your table with a deposit of <span className="text-gold-500 font-bold">KSh {payInfo?.deposit || 500}</span></p>
                <div className="bg-white/5 rounded-xl p-4 mb-4 text-left space-y-2">
                  <p className="text-white/80 text-sm font-medium">M-Pesa Payment Details</p>
                  <p className="text-white/60 text-xs">Till Number: <span className="text-white font-mono">{payInfo?.mpesa || '9217965'}</span></p>
                  <p className="text-white/60 text-xs">Amount: <span className="text-white font-mono">KSh {payInfo?.deposit || 500}</span></p>
                  <p className="text-white/60 text-xs">Account: <span className="text-white font-mono">{payInfo?.order?.orderNumber || 'TBL'}</span></p>
                </div>
                <p className="text-white/40 text-xs mb-6">Your reservation will be confirmed once payment is received.</p>
                <Button variant="primary" onClick={() => { setShowReserve(false); setReserved(false); setPayInfo(null) }}>Done</Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Your Name" value={reserveForm.name} onChange={(e) => setReserveForm({ ...reserveForm, name: e.target.value })} placeholder="John Doe" />
                  <PhoneInput label="Phone" value={reserveForm.phone} required onChange={(v) => setReserveForm({ ...reserveForm, phone: v })} />
                </div>
                <Input label="Email (optional)" type="email" value={reserveForm.email} onChange={(e) => setReserveForm({ ...reserveForm, email: e.target.value })} placeholder="john@example.com" />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Date" type="date" value={reserveForm.date} onChange={(e) => setReserveForm({ ...reserveForm, date: e.target.value })} />
                  <Input label="Time" type="time" value={reserveForm.time} onChange={(e) => setReserveForm({ ...reserveForm, time: e.target.value })} />
                </div>
                <Input label="Guests" type="number" min={1} value={reserveForm.guests} onChange={(e) => setReserveForm({ ...reserveForm, guests: parseInt(e.target.value) || 1 })} />
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-white/80">Special Requests</label>
                  <textarea value={reserveForm.notes} onChange={(e) => setReserveForm({ ...reserveForm, notes: e.target.value })}
                    className="h-20 w-full rounded-[14px] bg-white/5 border border-white/20 p-4 text-white placeholder:text-white/40 outline-none focus:border-gold-500 resize-none" placeholder="Any dietary requirements or special occasions?" />
                </div>
                <Button variant="primary" className="w-full" onClick={handleReserve} disabled={reserving || !reserveForm.name || reserveForm.phone.length !== 9 || !reserveForm.date || !reserveForm.time}>
                  {reserving ? 'Sending...' : 'Confirm Reservation'}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
