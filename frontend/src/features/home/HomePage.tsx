import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Wifi, Tv, Coffee, Shield, Building2, Car, MapPin } from 'lucide-react'
import Button from '@/components/ui/button'
import { Card, CardTitle } from '@/components/ui/card'
import { publicApi } from '@/services/publicApi'

const iconMap: Record<string, React.ReactNode> = {
  'Wifi': <Wifi size={28} />,
  'Tv': <Tv size={28} />,
  'Coffee': <Coffee size={28} />,
  'Shield': <Shield size={28} />,
  'Building2': <Building2 size={28} />,
  'Car': <Car size={28} />,
}

export default function HomePage() {
  const [homepage, setHomepage] = useState<any>({ content: {}, promotions: [] })
  const [slides, setSlides] = useState<any[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [testimonials, setTestimonials] = useState<any[]>([])
  const [mapAddress, setMapAddress] = useState('')
  const [contactAddress, setContactAddress] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      publicApi.getHomepage(),
      publicApi.getHeroSlides(),
      publicApi.getTestimonials(),
      publicApi.getContact(),
    ]).then(([hp, s, t, c]) => {
      setHomepage(hp)
      setSlides(s)
      setTestimonials(t)
      const addr = c.info?.find((i: any) => i.type === 'address')?.value
      if (addr) {
        setMapAddress(encodeURIComponent(addr))
        setContactAddress(addr)
      }
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (slides.length < 2) return
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [slides.length])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div>
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {slides.map((slide, i) => (
          <div key={slide.id} className={`absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 transition-opacity duration-1000 ${i === currentSlide ? 'opacity-100' : 'opacity-0'}`}
            style={{ backgroundImage: `url(${slide.imageUrl})` }} />
        ))}
        {slides.length === 0 && (
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
            style={{ backgroundImage: homepage.content?.heroImageUrl ? `url(${homepage.content.heroImageUrl})` : "url('/hero-bg.png')" }} />
        )}
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <h1
            key={currentSlide}
            className="text-5xl md:text-7xl xl:text-8xl font-heading font-bold text-white mb-6 leading-tight"
            style={{ animation: 'hero-text-in 0.8s ease-out both' }}
          >
            {slides[currentSlide]?.title || homepage.content?.heroTitle || 'The Yads Hood Hotel'}
          </h1>
          <p
            key={`sub-${currentSlide}`}
            className="text-xl md:text-2xl xl:text-3xl text-cream/80 font-body mb-10 max-w-3xl mx-auto"
            style={{ animation: 'hero-text-in 0.8s ease-out 0.15s both' }}
          >
            {slides[currentSlide]?.subtitle || homepage.content?.heroSubtitle || 'Luxury. Comfort. Kenyan Hospitality.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/book"><Button variant="primary" size="lg" className="xl:text-xl xl:px-10">Book Your Stay</Button></Link>
            <Link to="/rooms"><Button variant="secondary" size="lg" className="xl:text-xl xl:px-10">Explore Rooms</Button></Link>
          </div>
          {slides.length > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              {slides.map((_, i) => (
                <button key={i} onClick={() => setCurrentSlide(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${i === currentSlide ? 'bg-gold-500 w-8' : 'bg-theme-surface hover:bg-theme-surface'}`} />
              ))}
            </div>
          )}
        </div>
      </section>

      {homepage.content?.aboutText && (
        <section className="py-20 px-6 lg:px-20 xl:px-32 max-w-[1600px] mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl xl:text-5xl font-heading font-bold text-theme-text mb-6">About The Yads Hood Hotel</h2>
            <p className="text-theme-text opacity-70 text-lg xl:text-xl leading-relaxed">{homepage.content.aboutText}</p>
          </div>
        </section>
      )}

      <section className="py-20 px-6 lg:px-20 xl:px-32 max-w-[1600px] mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl xl:text-5xl font-heading font-bold text-theme-text mb-4">Why Choose The Yads Hood Hotel</h2>
          <p className="text-theme-text opacity-60 max-w-2xl mx-auto xl:text-lg">Experience the perfect blend of luxury, comfort, and Kenyan hospitality.</p>
        </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { icon: 'Building2', title: 'Comfortable Rooms', desc: 'Well-appointed rooms with premium amenities.' },
            { icon: 'Shield', title: 'Secure Parking', desc: '24/7 monitored parking with CCTV.' },
            { icon: 'Coffee', title: 'Restaurant & Bar', desc: 'Local and international cuisine.' },
            { icon: 'Building2', title: 'Conference Hall', desc: 'Modern facilities for meetings and events.' },
            { icon: 'Wifi', title: 'Free Wi-Fi', desc: 'High-speed internet throughout.' },
            { icon: 'Car', title: 'Excellent Service', desc: 'Professional staff dedicated to your comfort.' },
          ].map((f) => (
            <Card key={f.title} className="text-center">
              <div className="w-14 h-14 rounded-full bg-gold-500/20 flex items-center justify-center mx-auto mb-6">
                {iconMap[f.icon] || <Building2 size={28} className="text-gold-500" />}
              </div>
              <CardTitle className="text-center mb-3 xl:text-xl">{f.title}</CardTitle>
              <p className="text-theme-text opacity-60 text-sm xl:text-base">{f.desc}</p>
            </Card>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link to="/rooms"><Button variant="primary" size="lg" className="xl:text-xl xl:px-10">Browse Rooms</Button></Link>
        </div>
      </section>

      {testimonials.length > 0 && (
        <section className="py-20 px-6 lg:px-20 xl:px-32 max-w-[1600px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl xl:text-5xl font-heading font-bold text-theme-text mb-4">What Our Guests Say</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {testimonials.map((t: any) => (
              <Card key={t.id}>
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating || 5)].map((_, i) => (
                    <span key={i} className="text-gold-500 text-lg xl:text-xl">★</span>
                  ))}
                </div>
                <p className="text-theme-text opacity-70 mb-4 italic text-sm xl:text-base">&ldquo;{t.comment}&rdquo;</p>
                <p className="text-theme-text font-medium xl:text-lg">- {t.guest?.firstName} {t.guest?.lastName}</p>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section className="py-20 px-6 lg:px-20 xl:px-32 max-w-[1600px] mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl xl:text-5xl font-heading font-bold text-theme-text mb-4">Find Us</h2>
          <p className="text-theme-text opacity-60 xl:text-lg">Visit The Yads Hood Hotel — we're easy to find.</p>
        </div>
        <div className="relative rounded-[22px] overflow-hidden border border-theme">
          <iframe
            src={mapAddress ? `https://www.google.com/maps?q=${mapAddress}&output=embed` : 'https://www.google.com/maps?q=Kehancha+Migori+Kenya&output=embed'}
            width="100%" height="400" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
            title="The Yads Hood Hotel Location"
          />
          <div className="absolute top-4 right-4 max-w-[260px] glass rounded-[14px] border border-theme p-4 shadow-lg">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-gold-500/25 flex items-center justify-center flex-shrink-0">
                <MapPin size={18} className="text-gold-500" />
              </div>
              <div className="min-w-0">
                <p className="text-theme-text font-semibold text-sm mb-1">The Yads Hood Hotel</p>
                <p className="text-theme-text opacity-80 text-sm leading-snug">
                  {contactAddress || 'Igena - Mnadani Road, Kehancha'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
