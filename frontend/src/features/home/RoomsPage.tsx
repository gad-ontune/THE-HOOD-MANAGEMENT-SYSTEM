import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { X, Wifi, Tv, Coffee, Shield, Building2, Car, Users, BedDouble, Check } from 'lucide-react'
import Button from '@/components/ui/button'
import { Card, CardTitle } from '@/components/ui/card'
import Input from '@/components/ui/input'
import { publicApi } from '@/services/publicApi'
import { formatCurrency } from '@/lib/utils'
import { showToast } from '@/lib/toast'

const iconMap: Record<string, React.ReactNode> = {
  Wifi: <Wifi size={20} />, Tv: <Tv size={20} />, Coffee: <Coffee size={20} />,
  Shield: <Shield size={20} />, Building2: <Building2 size={20} />, Car: <Car size={20} />,
}

export default function RoomsPage() {
  const [roomTypes, setRoomTypes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<any>(null)

  useEffect(() => {
    publicApi.getRooms().then(setRoomTypes).finally(() => setLoading(false))
  }, [])

  const handleSearch = async () => {
    setSearching(true)
    await new Promise(r => setTimeout(r, 500))
    setSearching(false)
    showToast('Rooms loaded — select a room to book', 'success')
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
          <h1 className="text-4xl md:text-6xl font-heading font-bold text-white mb-4">Our Rooms</h1>
          <p className="text-lg text-white/70">Find your perfect stay at The Yads Hood Hotel</p>
        </div>
      </section>

      <section className="py-12 px-6 lg:px-20 xl:px-32 max-w-[1600px] mx-auto">
        <div className="glass rounded-[22px] p-6 md:p-8 mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Input label="Check-in" type="date" />
            <Input label="Check-out" type="date" />
            <Input label="Guests" type="number" defaultValue={1} />
            <div className="flex items-end"><Button variant="primary" className="w-full" onClick={handleSearch} disabled={searching}>{searching ? 'Searching...' : 'Search Rooms'}</Button></div>
          </div>
        </div>

        {roomTypes.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-theme-text opacity-50 text-lg xl:text-xl">No rooms available yet. Check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {roomTypes.map((room: any) => (
              <Card key={room.id} className="p-0 overflow-hidden group">
                <div className="h-[300px] xl:h-[350px] overflow-hidden">
                  <img src={room.image || '/hero-bg.png'} alt={room.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-2xl xl:text-3xl font-heading font-semibold text-theme-text">{room.name}</h3>
                    <span className="text-gold-500 text-2xl xl:text-3xl font-bold">{formatCurrency(room.price)}<span className="text-theme-text opacity-40 text-base xl:text-lg font-normal">/night</span></span>
                  </div>
                  <p className="text-theme-text opacity-50 text-sm xl:text-base mb-1">Up to {room.capacity} guests</p>
                  <p className="text-success text-xs xl:text-sm mb-4">{room.availableRooms > 0 ? `${room.availableRooms} rooms available` : 'Sold out'}</p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {room.amenities?.map((a: string) => (
                      <span key={a} className="px-3 py-1.5 bg-theme-surface rounded-full text-xs xl:text-sm text-theme-text opacity-60">{iconMap[a] || null} {a}</span>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <Link to="/book" className="flex-1"><Button variant="primary" className="w-full xl:text-lg">Book Now</Button></Link>
                    <Button variant="secondary" className="flex-1 xl:text-lg" onClick={() => setSelectedRoom(room)}>View Details</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelectedRoom(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[22px] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="relative h-64 overflow-hidden rounded-t-[22px]">
              <img src={selectedRoom.image || '/hero-bg.png'} alt={selectedRoom.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <button onClick={() => setSelectedRoom(null)} className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 rounded-full p-2 text-white transition-colors"><X size={20} /></button>
              <div className="absolute bottom-4 left-6">
                <h3 className="text-3xl font-heading font-bold text-white">{selectedRoom.name}</h3>
                <span className="text-gold-500 text-xl font-bold">{formatCurrency(selectedRoom.price)}<span className="text-white/50 text-sm font-normal">/night</span></span>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 rounded-xl bg-white/5">
                  <Users size={20} className="mx-auto text-gold-500 mb-1" />
                  <p className="text-white text-xs">Up to {selectedRoom.capacity} Guests</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-white/5">
                  <BedDouble size={20} className="mx-auto text-gold-500 mb-1" />
                  <p className="text-white text-xs">{selectedRoom.availableRooms > 0 ? `${selectedRoom.availableRooms} Available` : 'Sold out'}</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-white/5">
                  <Building2 size={20} className="mx-auto text-gold-500 mb-1" />
                  <p className="text-white text-xs">Premium Room</p>
                </div>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-3">About this room</h4>
                <p className="text-white/60 text-sm leading-relaxed">{selectedRoom.description || 'Experience luxury and comfort in our carefully designed room.'}</p>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-3">Amenities & Specialities</h4>
                <div className="grid grid-cols-2 gap-3">
                  {(selectedRoom.amenities?.length ? selectedRoom.amenities : ['Wifi', 'Tv', 'Coffee', 'Shield', 'Air Conditioning', 'Room Service']).map((a: string) => (
                    <div key={a} className="flex items-center gap-2 text-white/70 text-sm">
                      <Check size={16} className="text-gold-500 flex-shrink-0" />
                      {a}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Link to="/book" className="flex-1"><Button variant="primary" className="w-full">Book Now</Button></Link>
                <Button variant="secondary" onClick={() => setSelectedRoom(null)}>Close</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
