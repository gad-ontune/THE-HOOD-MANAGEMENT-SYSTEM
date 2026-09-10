import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import Button from '@/components/ui/button'
import ThemeSelector from '@/components/ThemeSelector'
import YHLogo from '@/components/YHLogo'
import { publicApi } from '@/services/publicApi'
import { waLink, mailtoLink, mapsLink } from '@/lib/utils'

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Rooms', path: '/rooms' },
  { label: 'Restaurant', path: '/restaurant' },
  { label: 'Events', path: '/events' },
  { label: 'Gallery', path: '/gallery' },
  { label: 'Contact', path: '/contact' },
]

export default function PublicLayout({ onLogoClick }: { onLogoClick?: () => void }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [contact, setContact] = useState<any>({ info: [], hotel: {} })
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    publicApi.getContact().then(setContact).catch(() => {})
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-theme-bg">
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-20 xl:px-32">
          <div className="flex items-center justify-between h-20">
            <button
              onClick={() => {
                navigate('/')
                onLogoClick?.()
              }}
              className="flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-brand-soft-gold rounded"
            >
              <YHLogo size={40} variant="nav" phase="idle" />
            </button>
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium transition-colors duration-300 ${
                    location.pathname === link.path
                      ? 'text-theme-accent'
                      : 'text-theme-text opacity-70 hover:text-theme-accent'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="hidden lg:flex items-center gap-3">
              <ThemeSelector />
              <Link to="/book">
                <Button variant="primary" size="sm">Book Your Stay</Button>
              </Link>
              <Link to="/login">
                <Button variant="ghost" size="sm">Staff Login</Button>
              </Link>
            </div>
            <button
              className="lg:hidden text-theme-text p-2"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
        {mobileOpen && (
          <div className="lg:hidden glass border-t border-theme">
            <div className="px-6 py-4 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className="block py-2 text-theme-text opacity-70 hover:text-gold-500"
                >
                  {link.label}
                </Link>
              ))}
              <Link to="/book" onClick={() => setMobileOpen(false)}>
                <Button variant="primary" className="w-full">Book Your Stay</Button>
              </Link>
              <Link to="/login" onClick={() => setMobileOpen(false)}>
                <Button variant="ghost" className="w-full">Staff Login</Button>
              </Link>
            </div>
          </div>
        )}
      </header>
      <main className="pt-20">
        <Outlet />
      </main>
      <footer className="bg-theme-bg border-t border-theme py-16">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-20 xl:px-32">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div>
              <h3 className="text-xl font-heading font-bold text-gold-500 mb-4">The Yads Hood Hotel</h3>
              <p className="text-theme-text opacity-80 text-sm leading-relaxed">
                Located along Igena - Mnadani Road, Kehancha. Experience luxury, comfort, and Kenyan hospitality at its finest.
              </p>
            </div>
            <div>
              <h4 className="text-theme-text font-semibold mb-4">Quick Links</h4>
              <div className="space-y-2 text-sm text-theme-text opacity-80">
                <Link to="/rooms" className="block hover:text-gold-500">Rooms</Link>
                <Link to="/restaurant" className="block hover:text-gold-500">Restaurant</Link>
                <Link to="/events" className="block hover:text-gold-500">Events</Link>
                <Link to="/gallery" className="block hover:text-gold-500">Gallery</Link>
              </div>
            </div>
            <div>
              <h4 className="text-theme-text font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-sm text-theme-text opacity-80">
                {contact.info?.filter((i: any) => i.type === 'address').map((i: any) => (
                  <a key={i.id} href={mapsLink(i.value)} target="_blank" rel="noopener noreferrer" className="block hover:text-gold-500 transition-colors">{i.value}</a>
                ))}
                {contact.info?.filter((i: any) => i.type === 'phone').map((i: any) => (
                  <a key={i.id} href={waLink(i.value)} target="_blank" rel="noopener noreferrer" className="block hover:text-gold-500 transition-colors">{i.value}</a>
                ))}
                {contact.info?.filter((i: any) => i.type === 'email').map((i: any) => (
                  <a key={i.id} href={mailtoLink(i.value)} className="block hover:text-gold-500 transition-colors">{i.value}</a>
                ))}
                {(!contact.info || contact.info.length === 0) && (
                  <>
                    <a href={mapsLink('Igena - Mnadani Road, Kehancha')} target="_blank" rel="noopener noreferrer" className="block hover:text-gold-500 transition-colors">Igena - Mnadani Road, Kehancha</a>
                    <a href={waLink('+254757915384')} target="_blank" rel="noopener noreferrer" className="block hover:text-gold-500 transition-colors">+254 757 915 384</a>
                    <a href={waLink('+254785859400')} target="_blank" rel="noopener noreferrer" className="block hover:text-gold-500 transition-colors">+254 785 859 400</a>
                    <a href={mailtoLink('yadshoodhotel@gmail.com')} className="block hover:text-gold-500 transition-colors">yadshoodhotel@gmail.com</a>
                  </>
                )}
              </div>
            </div>
            <div>
              <h4 className="text-theme-text font-semibold mb-4">Follow Us</h4>
              <div className="space-y-2 text-sm text-theme-text opacity-80">
                {contact.info?.filter((i: any) => ['facebook', 'instagram', 'twitter', 'youtube', 'tiktok'].includes(i.type)).map((i: any) => (
                  <a key={i.id} href={i.value} target="_blank" rel="noopener noreferrer" className="block hover:text-gold-500">{i.label || i.type}</a>
                ))}
                {(!contact.info || contact.info.length === 0) && (
                  <>
                    <a href="https://facebook.com/yadshoodhotel" target="_blank" rel="noopener noreferrer" className="block hover:text-gold-500">Facebook</a>
                    <a href="#" className="block hover:text-gold-500 opacity-50 cursor-not-allowed">Instagram</a>
                    <a href="#" className="block hover:text-gold-500 opacity-50 cursor-not-allowed">Twitter / X</a>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="border-t border-theme pt-8 text-center text-sm text-theme-text opacity-70">
            &copy; {new Date().getFullYear()} The Yads Hood Hotel. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
