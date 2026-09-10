import { useState, useEffect } from 'react'
import { X, Users, CheckCircle, Phone } from 'lucide-react'
import Button from '@/components/ui/button'
import { Card, CardTitle } from '@/components/ui/card'
import Input from '@/components/ui/input'
import PhoneInput from '@/components/ui/phone-input'
import { publicApi } from '@/services/publicApi'
import { formatCurrency } from '@/lib/utils'

export default function EventsPage() {
  const [packages, setPackages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPkg, setSelectedPkg] = useState<any>(null)
  const [gallery, setGallery] = useState<any[]>([])
  const [showBooking, setShowBooking] = useState(false)
  const [saving, setSaving] = useState(false)
  const [bookingResult, setBookingResult] = useState<any>(null)
  const [form, setForm] = useState({ contactName: '', contactPhone: '', eventDate: '', guestCount: '' })

  useEffect(() => {
    Promise.all([
      publicApi.getEventPackages(),
      publicApi.getGallery().then((g: any) => g.images || []),
    ]).then(([pkgs, imgs]) => {
      setPackages(pkgs)
      setGallery(imgs)
    }).finally(() => setLoading(false))
  }, [])

  const openBooking = () => {
    setForm({ contactName: '', contactPhone: '', eventDate: '', guestCount: '' })
    setBookingResult(null)
    setShowBooking(true)
  }

  const submitBooking = async () => {
    if (!form.contactName || form.contactPhone.length !== 9 || !form.eventDate || !form.guestCount) return
    setSaving(true)
    try {
      const result = await publicApi.bookEvent({
        packageId: selectedPkg.id,
        contactName: form.contactName,
        contactPhone: form.contactPhone,
        eventDate: form.eventDate,
        guestCount: parseInt(form.guestCount),
      })
      setBookingResult(result)
    } catch {
      alert('Booking failed. Please try again.')
    }
    setSaving(false)
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
          <h1 className="text-4xl md:text-6xl font-heading font-bold text-white mb-4">Events & Conference</h1>
          <p className="text-lg text-white/70">Host your special occasions at The Yads Hood Hotel</p>
        </div>
      </section>

      <section className="py-16 px-6 lg:px-20 xl:px-32 max-w-[1600px] mx-auto">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl xl:text-5xl font-heading font-bold text-theme-text mb-4">Event Packages</h2>
          <p className="text-theme-text opacity-60 xl:text-lg">Choose from our curated event packages designed to make your occasion memorable.</p>
        </div>

        {packages.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-theme-text opacity-50 text-lg xl:text-xl">Event packages coming soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {packages.map((pkg: any) => (
              <Card key={pkg.id} className="overflow-hidden">
                {pkg.imageUrl && (
                  <div className="h-48 xl:h-56 overflow-hidden">
                    <img src={pkg.imageUrl} alt={pkg.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-6">
                  <CardTitle className="mb-2 xl:text-xl">{pkg.name}</CardTitle>
                  <p className="text-theme-text opacity-50 text-sm xl:text-base mb-2">
                    {pkg.hall?.name || ''}{pkg.maxGuests ? ` — Up to ${pkg.maxGuests} guests` : pkg.hall?.capacity ? ` — Up to ${pkg.hall.capacity} guests` : ''}
                  </p>
                  <p className="text-3xl xl:text-4xl font-heading font-bold text-gold-500 mb-6">{formatCurrency(pkg.price)}</p>
                  <div className="space-y-3 mb-8">
                    {pkg.items?.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-2 text-sm xl:text-base text-theme-text opacity-70">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold-500" />
                        {item.itemName} x{item.quantity}
                      </div>
                    ))}
                  </div>
                  <Button variant="primary" className="w-full xl:text-lg" onClick={() => setSelectedPkg(pkg)}>View Details</Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {selectedPkg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelectedPkg(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[22px] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="relative h-56 overflow-hidden rounded-t-[22px]">
              <img src={selectedPkg.imageUrl || '/hero-bg.png'} alt={selectedPkg.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <button onClick={() => setSelectedPkg(null)} className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 rounded-full p-2 text-white"><X size={20} /></button>
              <div className="absolute bottom-4 left-6">
                <h3 className="text-3xl font-heading font-bold text-white">{selectedPkg.name}</h3>
                <span className="text-gold-500 text-xl font-bold">{formatCurrency(selectedPkg.price)}</span>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10">
                  <Users size={16} className="text-gold-500" />
                  <span className="text-white text-sm">Up to {selectedPkg.maxGuests || selectedPkg.hall?.capacity || '—'} guests</span>
                </div>
              </div>
              <p className="text-white/70 text-sm leading-relaxed">{selectedPkg.description || 'No description available.'}</p>
              {selectedPkg.items?.length > 0 && (
                <div>
                  <h4 className="text-white font-semibold mb-3">What's Included</h4>
                  <div className="space-y-2">
                    {selectedPkg.items.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-2 text-white/60 text-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold-500 flex-shrink-0" />
                        {item.itemName} x{item.quantity}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {gallery.length > 0 && (
                <div>
                  <h4 className="text-white font-semibold mb-3">Event Gallery</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {gallery.slice(0, 6).map((img: any) => (
                      <img key={img.id} src={img.imageUrl} alt={img.altText || ''} className="rounded-xl h-24 w-full object-cover" />
                    ))}
                  </div>
                </div>
              )}
              <Button variant="primary" className="w-full" onClick={openBooking}>Book This Package</Button>
            </div>
          </div>
        </div>
      )}

      {showBooking && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={() => !saving && setShowBooking(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[22px] p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => !saving && setShowBooking(false)} className="absolute top-4 right-4 text-white/60 hover:text-white"><X size={24} /></button>

            {!bookingResult ? (
              <>
                <h3 className="text-2xl font-heading font-bold text-white mb-2">Book {selectedPkg?.name}</h3>
                <p className="text-white/50 text-sm mb-6">Fill in your details to reserve this package. A 30% deposit is required.</p>

                <Input label="Your Name" value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} placeholder="John Doe" />
                <PhoneInput label="Phone Number" required value={form.contactPhone} onChange={(v) => setForm({ ...form, contactPhone: v })} />
                <Input label="Event Date" type="date" value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} />
                <Input label="Expected Guests" type="number" value={form.guestCount} onChange={(e) => setForm({ ...form, guestCount: e.target.value })} placeholder="100" />

                <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-white/5 mb-4">
                  <span className="text-white/70 text-sm">Deposit (30%)</span>
                  <span className="text-gold-500 font-bold">{formatCurrency(selectedPkg ? selectedPkg.price * 0.3 : 0)}</span>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="primary" className="flex-1" onClick={submitBooking} disabled={saving || !form.contactName || form.contactPhone.length !== 9 || !form.eventDate || !form.guestCount}>
                    {saving ? 'Processing...' : `Pay Deposit with M-Pesa`}
                  </Button>
                  <Button variant="secondary" onClick={() => setShowBooking(false)}>Cancel</Button>
                </div>
              </>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4">
                    <CheckCircle size={32} className="text-green-400" />
                  </div>
                  <h3 className="text-2xl font-heading font-bold text-white">Booking Initiated!</h3>
                  <p className="text-white/50 text-sm mt-1">Complete payment to confirm your event.</p>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between py-2 px-4 rounded-xl bg-white/5">
                    <span className="text-white/60 text-sm">Event</span>
                    <span className="text-white font-medium">{bookingResult.booking.eventName}</span>
                  </div>
                  <div className="flex justify-between py-2 px-4 rounded-xl bg-white/5">
                    <span className="text-white/60 text-sm">Date</span>
                    <span className="text-white font-medium">{new Date(bookingResult.booking.eventDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between py-2 px-4 rounded-xl bg-white/5">
                    <span className="text-white/60 text-sm">Guests</span>
                    <span className="text-white font-medium">{bookingResult.booking.guestCount}</span>
                  </div>
                  <div className="flex justify-between py-2 px-4 rounded-xl bg-white/5">
                    <span className="text-white/60 text-sm">Total</span>
                    <span className="text-white font-medium">{formatCurrency(bookingResult.booking.totalAmount)}</span>
                  </div>
                </div>

                <div className="rounded-2xl bg-gradient-to-br from-gold-500/20 to-gold-500/5 border border-gold-500/30 p-6 mb-6">
                  <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Phone size={18} className="text-gold-400" />
                    Pay with M-Pesa
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white/60 text-sm">Method</span>
                      <span className="text-gold-400 font-bold">{bookingResult.mpesa.method}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60 text-sm">{bookingResult.mpesa.method === 'Buy Goods Till' ? 'Till Number' : 'Number'}</span>
                      <span className="text-white font-mono font-bold text-lg">{bookingResult.mpesa.number}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60 text-sm">Amount</span>
                      <span className="text-gold-400 font-bold text-lg">{formatCurrency(bookingResult.mpesa.amount)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60 text-sm">Account</span>
                      <span className="text-white font-mono font-bold">{bookingResult.mpesa.account}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-white/50 text-xs leading-relaxed">
                      Go to M-Pesa → Lipa na M-PESA → {bookingResult.mpesa.method === 'Buy Goods Till' ? 'Buy Goods and Services' : 'Paybill'} → Enter <strong className="text-white">{bookingResult.mpesa.number}</strong> → Account <strong className="text-white">{bookingResult.mpesa.account}</strong> → Amount <strong className="text-white">{formatCurrency(bookingResult.mpesa.amount)}</strong>
                    </p>
                  </div>
                </div>

                <Button variant="primary" className="w-full" onClick={() => { setShowBooking(false); setSelectedPkg(null); setBookingResult(null) }}>
                  Done
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
