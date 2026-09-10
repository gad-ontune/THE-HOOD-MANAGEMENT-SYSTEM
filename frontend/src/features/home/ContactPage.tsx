import { useState, useEffect } from 'react'
import { Phone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react'
import { Card, CardTitle } from '@/components/ui/card'
import Input from '@/components/ui/input'
import PhoneInput from '@/components/ui/phone-input'
import Button from '@/components/ui/button'
import { publicApi } from '@/services/publicApi'
import { waLink, mailtoLink, mapsLink, mapsEmbedSrc } from '@/lib/utils'

export default function ContactPage() {
  const [contact, setContact] = useState<any>({ info: [] })
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', phone: '', email: '', subject: '', message: '' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    publicApi.getContact().then(setContact).finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    try {
      await publicApi.submitContact(form)
      setSent(true)
      setForm({ name: '', phone: '', email: '', subject: '', message: '' })
    } catch {
      alert('Failed to send message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const getInfo = (type: string) => contact.info?.find((i: any) => i.type === type)
  const getSocials = () => contact.info?.filter((i: any) => ['facebook', 'instagram', 'twitter', 'youtube', 'tiktok'].includes(i.type)) || []

  const infoMap: Record<string, { icon: React.ReactNode; label: string }> = {
    address: { icon: <MapPin size={22} />, label: 'Address' },
    phone: { icon: <Phone size={22} />, label: 'Phone' },
    email: { icon: <Mail size={22} />, label: 'Email' },
    whatsapp: { icon: <MessageCircle size={22} />, label: 'WhatsApp' },
    hours: { icon: <Clock size={22} />, label: 'Operating Hours' },
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
          <h1 className="text-4xl md:text-6xl font-heading font-bold text-white mb-4">Contact Us</h1>
          <p className="text-lg text-white/70">We'd love to hear from you</p>
        </div>
      </section>

      <section className="py-16 px-6 lg:px-20 xl:px-32 max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl md:text-4xl xl:text-5xl font-heading font-bold text-theme-text mb-8">Get In Touch</h2>
            <div className="space-y-6 mb-10">
              {['address', 'phone', 'email', 'whatsapp', 'hours'].map((type) => {
                const item = getInfo(type)
                if (!item) return null
                const value = item.value
                let href: string | undefined
                let external = false
                if (type === 'address') { href = mapsLink(value); external = true }
                else if (type === 'phone' || type === 'whatsapp') { href = waLink(value); external = true }
                else if (type === 'email') { href = mailtoLink(value) }
                const body = (
                  <>
                    <p className="text-theme-text font-medium xl:text-lg">{infoMap[type]?.label || type}</p>
                    <p className="text-theme-text opacity-80 text-sm xl:text-base">{value}</p>
                  </>
                )
                return (
                  <div key={type} className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gold-500/20 flex items-center justify-center flex-shrink-0">{infoMap[type]?.icon}</div>
                    <div className="min-w-0">
                      {href ? (
                        <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined} className="group block hover:text-gold-500 transition-colors">{body}</a>
                      ) : body}
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="rounded-[22px] overflow-hidden border border-theme mb-10">
              <iframe
                src={mapsEmbedSrc(getInfo('address')?.value || 'Kehancha, Migori County, Kenya')}
                width="100%" height="320" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                title="The Yads Hood Hotel Location"
              />
            </div>
            {getSocials().length > 0 && (
              <div>
                <h3 className="text-xl xl:text-2xl font-heading font-bold text-theme-text mb-4">Follow Us</h3>
                <div className="space-y-2 text-sm xl:text-base text-theme-text opacity-80">
                  {getSocials().map((s: any) => (
                    <a key={s.id} href={s.value} target="_blank" rel="noopener noreferrer"
                      className="block text-theme-text opacity-80 hover:text-gold-500 transition-colors">
                      {s.label || s.type}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
          <Card>
            <CardTitle className="mb-6 xl:text-xl">{sent ? 'Message Sent!' : 'Send Us a Message'}</CardTitle>
            {sent ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4"><MessageCircle size={32} className="text-success" /></div>
                <p className="text-theme-text text-lg xl:text-xl font-medium">Thank you for reaching out!</p>
                <p className="text-theme-text opacity-50 text-sm xl:text-base mt-1">We'll get back to you shortly.</p>
                <Button variant="secondary" size="sm" className="mt-4 xl:text-base" onClick={() => setSent(false)}>Send Another Message</Button>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <Input label="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Doe" required />
                <PhoneInput label="Phone" required value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
                <Input label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@example.com" />
                <Input label="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="How can we help?" />
                <div className="space-y-1.5">
                  <label className="block text-sm xl:text-base font-medium text-theme-text opacity-80">Message</label>
                  <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="h-32 w-full rounded-[14px] bg-theme-bg-card border border-theme p-4 text-theme-text placeholder:text-theme-muted outline-none focus:border-gold-500 resize-none" placeholder="Write your message..." required />
                </div>
                <Button variant="primary" className="w-full xl:text-lg" onClick={handleSubmit} disabled={sending || !form.name || form.phone.length !== 9 || !form.message}>{sending ? 'Sending...' : 'Send Message'}</Button>
              </form>
            )}
          </Card>
        </div>
      </section>
    </div>
  )
}
