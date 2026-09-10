import { useState, useEffect } from 'react'
import { CheckCircle, Loader2 } from 'lucide-react'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import PhoneInput from '@/components/ui/phone-input'
import { Card, CardTitle } from '@/components/ui/card'
import { publicApi } from '@/services/publicApi'
import { formatCurrency } from '@/lib/utils'

const steps = ['Select Dates', 'Choose Room', 'Guest Info', 'Payment', 'Confirmation']

export default function BookPage() {
  const [roomTypes, setRoomTypes] = useState<any[]>([])
  const [step, setStep] = useState(0)
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [dates, setDates] = useState({ checkIn: '', checkOut: '', adults: 1, children: 0 })
  const [guest, setGuest] = useState({ firstName: '', lastName: '', phone: '', email: '', nationality: '', specialRequests: '' })

  useEffect(() => {
    publicApi.getRooms().then((rooms) => {
      setRoomTypes(rooms)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const submitBooking = async () => {
    if (selectedRoom === null) return
    setSubmitting(true)
    try {
      const room = roomTypes[selectedRoom]
      const res = await publicApi.bookRoom({
        firstName: guest.firstName,
        lastName: guest.lastName,
        phone: guest.phone,
        email: guest.email || undefined,
        nationality: guest.nationality || undefined,
        roomTypeId: room.id,
        checkIn: dates.checkIn,
        checkOut: dates.checkOut,
        adults: dates.adults,
        children: dates.children,
        specialRequests: guest.specialRequests || undefined,
      })
      setResult(res)
      setStep(4)
    } catch (e: any) {
      alert(e.response?.data?.message || e.message || 'Booking failed. Please try again.')
    }
    setSubmitting(false)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div>
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/hero-bg.png')" }} />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-heading font-bold text-white mb-4">Book Your Stay</h1>
          <p className="text-lg text-white/70">Reserve your room in just a few clicks</p>
        </div>
      </section>

      <section className="py-16 px-6 lg:px-20 xl:px-32 max-w-[1600px] mx-auto">
        <div className="flex items-center justify-center gap-2 mb-16 overflow-x-auto">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center flex-shrink-0">
              <div className={`w-10 h-10 xl:w-12 xl:h-12 rounded-full flex items-center justify-center text-sm xl:text-base font-bold transition-all duration-300 ${i <= step ? 'bg-gold-500 text-forest-950' : 'bg-theme-surface text-theme-text opacity-40'}`}>{i + 1}</div>
              <span className={`ml-2 text-sm xl:text-base hidden md:block ${i <= step ? 'text-gold-500' : 'text-theme-text opacity-40'}`}>{s}</span>
              {i < steps.length - 1 && <div className={`w-8 md:w-16 xl:w-24 h-0.5 mx-2 ${i < step ? 'bg-gold-500' : 'bg-theme-surface'}`} />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2">
            <Card>
              {step === 0 && (
                <div>
                  <CardTitle className="mb-6 xl:text-xl">Select Your Dates</CardTitle>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <Input label="Check-in Date" type="date" value={dates.checkIn} onChange={(e) => setDates({ ...dates, checkIn: e.target.value })} />
                    <Input label="Check-out Date" type="date" value={dates.checkOut} onChange={(e) => setDates({ ...dates, checkOut: e.target.value })} />
                    <Input label="Adults" type="number" value={dates.adults} onChange={(e) => setDates({ ...dates, adults: parseInt(e.target.value) || 1 })} min={1} />
                    <Input label="Children" type="number" value={dates.children} onChange={(e) => setDates({ ...dates, children: parseInt(e.target.value) || 0 })} min={0} />
                  </div>
                  <Button variant="primary" onClick={() => setStep(1)} disabled={!dates.checkIn || !dates.checkOut}>Check Availability</Button>
                </div>
              )}

              {step === 1 && (
                <div>
                  <CardTitle className="mb-6 xl:text-xl">Choose Your Room</CardTitle>
                  {roomTypes.length === 0 ? (
                    <p className="text-theme-text opacity-50 text-center py-8">No rooms available at this time.</p>
                  ) : (
                    <div className="space-y-4">
                      {roomTypes.map((room, i) => (
                        <div key={room.id}
                          onClick={() => setSelectedRoom(i)}
                          className={`p-4 rounded-[14px] border cursor-pointer transition-all duration-300 ${selectedRoom === i ? 'border-gold-500 bg-gold-500/10' : 'border-theme hover:border-gold-500/50'}`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-theme-text font-semibold xl:text-lg">{room.name}</h4>
                              <p className="text-theme-text opacity-50 text-xs xl:text-sm">Up to {room.capacity} guests &middot; {room.availableRooms} available</p>
                            </div>
                            <div className="text-right">
                              <p className="text-gold-500 font-bold text-xl xl:text-2xl">{formatCurrency(room.price)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-3 mt-6">
                    <Button variant="secondary" onClick={() => setStep(0)}>Back</Button>
                    <Button variant="primary" onClick={() => setStep(2)} disabled={selectedRoom === null || roomTypes.length === 0}>Continue</Button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <CardTitle className="mb-6 xl:text-xl">Guest Information</CardTitle>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="First Name" value={guest.firstName} onChange={(e) => setGuest({ ...guest, firstName: e.target.value })} placeholder="John" />
                    <Input label="Last Name" value={guest.lastName} onChange={(e) => setGuest({ ...guest, lastName: e.target.value })} placeholder="Doe" />
                    <PhoneInput label="Phone" value={guest.phone} onChange={(v) => setGuest({ ...guest, phone: v })} placeholder="712 345 678" />
                    <Input label="Email" value={guest.email} onChange={(e) => setGuest({ ...guest, email: e.target.value })} placeholder="john@example.com" />
                    <Input label="Nationality" value={guest.nationality} onChange={(e) => setGuest({ ...guest, nationality: e.target.value })} placeholder="Kenyan" />
                    <Input label="Special Requests" value={guest.specialRequests} onChange={(e) => setGuest({ ...guest, specialRequests: e.target.value })} placeholder="Any special requirements..." />
                  </div>
                  <div className="flex gap-3 mt-6">
                    <Button variant="secondary" onClick={() => setStep(1)}>Back</Button>
                    <Button variant="primary" onClick={() => setStep(3)} disabled={!guest.firstName || !guest.lastName || guest.phone.length !== 9}>Continue to Payment</Button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <CardTitle className="mb-6 xl:text-xl">Payment Method</CardTitle>
                  <div className="space-y-3 mb-6">
                    {['Cash on Arrival'].map((method) => (
                      <div key={method} className="p-4 rounded-[14px] border border-theme bg-theme-surface/50 transition-all duration-300 flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full border-2 border-gold-500 flex items-center justify-center"><div className="w-2.5 h-2.5 rounded-full bg-gold-500" /></div>
                        <span className="text-theme-text xl:text-lg">{method}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <Button variant="secondary" onClick={() => setStep(2)}>Back</Button>
                    <Button variant="primary" onClick={submitBooking} disabled={submitting}>
                      {submitting ? <><Loader2 size={18} className="animate-spin" /> Processing...</> : 'Complete Booking'}
                    </Button>
                  </div>
                </div>
              )}

              {step === 4 && result && (
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={40} className="text-success" />
                  </div>
                  <CardTitle className="text-center mb-2 xl:text-xl">Booking Confirmed!</CardTitle>
                  <p className="text-theme-text opacity-60 mb-6 xl:text-lg">Thank you for choosing The Yads Hood Hotel.</p>
                  <div className="bg-theme-surface rounded-[14px] p-6 mb-6 text-left space-y-3">
                    <div className="flex justify-between"><span className="text-theme-text opacity-60">Booking Number</span><span className="text-gold-500 font-bold">{result.reservation?.number}</span></div>
                    <div className="flex justify-between"><span className="text-theme-text opacity-60">Room</span><span className="text-theme-text">Room {result.room?.number}</span></div>
                    <div className="flex justify-between"><span className="text-theme-text opacity-60">Guest</span><span className="text-theme-text">{result.guest?.name}</span></div>
                    <div className="flex justify-between"><span className="text-theme-text opacity-60">Amount</span><span className="text-theme-text font-bold">{result.reservation?.totalAmount ? formatCurrency(result.reservation.totalAmount) : '—'}</span></div>
                    <div className="flex justify-between"><span className="text-theme-text opacity-60">Status</span><span className="text-success">Confirmed ✓</span></div>
                  </div>
                  <Button variant="primary" onClick={() => window.location.href = '/'}>Back to Home</Button>
                </div>
              )}
            </Card>
          </div>

          <div className="xl:col-span-1">
            <Card>
              <CardTitle className="mb-4 xl:text-xl">Booking Summary</CardTitle>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-theme-text opacity-60">Room</span><span className="text-theme-text">{selectedRoom !== null ? roomTypes[selectedRoom]?.name : 'Not selected'}</span></div>
                <div className="flex justify-between"><span className="text-theme-text opacity-60">Check-in</span><span className="text-theme-text">{dates.checkIn || '—'}</span></div>
                <div className="flex justify-between"><span className="text-theme-text opacity-60">Check-out</span><span className="text-theme-text">{dates.checkOut || '—'}</span></div>
                <div className="flex justify-between"><span className="text-theme-text opacity-60">Guests</span><span className="text-theme-text">{dates.adults} Adult{dates.adults !== 1 ? 's' : ''}{dates.children ? `, ${dates.children} Child${dates.children !== 1 ? 'ren' : ''}` : ''}</span></div>
                <div className="border-t border-theme pt-3 mt-3">
                  <div className="flex justify-between font-bold"><span className="text-theme-text">Total</span>
                    <span className="text-gold-500 text-lg xl:text-xl">{selectedRoom !== null ? formatCurrency(roomTypes[selectedRoom]?.price) : '—'}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
