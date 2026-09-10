import { useState, useEffect, useRef } from 'react'
import { Card, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import PhoneInput from '@/components/ui/phone-input'
import Select from '@/components/ui/select'
import { cmsApi } from '@/services/publicApi'
import { useUIStore } from '@/store/uiStore'
import { X, Plus, Pencil, Trash2, Globe, Image, MessageCircle, Megaphone, Phone, Search, Link2, Images, Utensils, Bed, Calendar, Upload, Palette, FileText } from 'lucide-react'

type Tab = 'homepage' | 'hero' | 'partners' | 'faq' | 'gallery' | 'rooms' | 'menu' | 'events' | 'promotions' | 'contact' | 'seo' | 'theme' | 'files'

const tabs: { key: Tab; icon: any; label: string }[] = [
  { key: 'homepage', icon: Globe, label: 'Homepage' },
  { key: 'hero', icon: Images, label: 'Backgrounds' },
  { key: 'rooms', icon: Bed, label: 'Room Types' },
  { key: 'menu', icon: Utensils, label: 'Menu' },
  { key: 'events', icon: Calendar, label: 'Events' },
  { key: 'gallery', icon: Image, label: 'Gallery' },
  { key: 'partners', icon: Link2, label: 'Partners' },
  { key: 'promotions', icon: Megaphone, label: 'Promotions' },
  { key: 'faq', icon: MessageCircle, label: 'FAQs' },
  { key: 'contact', icon: Phone, label: 'Contact Info' },
  { key: 'theme', icon: Palette, label: 'Theme' },
  { key: 'seo', icon: Search, label: 'SEO' },
  { key: 'files', icon: FileText, label: 'Files' },
]

export default function CmsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('homepage')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <div className="page-container">
      <div>
        <h1 className="text-3xl font-heading font-bold text-theme-text">Website CMS</h1>
        <p className="text-theme-text opacity-50 mt-1">Manage all public website content</p>
      </div>

      <div className="flex gap-2 overflow-x-auto md:overflow-visible md:flex-wrap pb-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-[14px] font-medium transition-all duration-300 whitespace-nowrap text-sm ${
              activeTab === t.key
                ? 'bg-gold-500 text-forest-950'
                : 'bg-theme-surface/50 text-theme-text opacity-60 hover:bg-theme-accent/10 hover:text-theme-accent hover:opacity-100'
            }`}
          >
            <t.icon size={16} />
            {t.label}
          </button>
        ))}
      </div>

      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-[14px] shadow-xl text-theme-text font-medium ${
          toast.type === 'success' ? 'bg-success' : 'bg-danger'
        }`}>
          {toast.message}
        </div>
      )}

      {activeTab === 'homepage' && <HomepageEditor showToast={showToast} />}
      {activeTab === 'hero' && <HeroSlidesEditor showToast={showToast} />}
      {activeTab === 'partners' && <PartnersEditor showToast={showToast} />}
      {activeTab === 'faq' && <FaqEditor showToast={showToast} />}
      {activeTab === 'gallery' && <GalleryEditor showToast={showToast} />}
      {activeTab === 'rooms' && <RoomTypesEditor showToast={showToast} />}
      {activeTab === 'menu' && <MenuEditor showToast={showToast} />}
      {activeTab === 'events' && <EventsEditor showToast={showToast} />}
      {activeTab === 'promotions' && <PromotionsEditor showToast={showToast} />}
      {activeTab === 'contact' && <ContactEditor showToast={showToast} />}
      {activeTab === 'theme' && <ThemeEditor showToast={showToast} />}
      {activeTab === 'seo' && <SeoEditor showToast={showToast} />}
      {activeTab === 'files' && <FilesManager showToast={showToast} />}
    </div>
  )
}

function ImageUploader({ onUpload }: { onUpload: (url: string) => void }) {
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const res = await cmsApi.uploadFile(file)
      onUpload(res.url)
    } catch { console.error('Upload failed') }
    finally { setUploading(false) }
  }

  return (
    <div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="flex items-center gap-2 px-4 py-2 rounded-[14px] bg-theme-surface border border-dashed border-theme text-theme-text opacity-60 hover:border-gold-500/50 hover:text-gold-500 transition-all text-sm">
        <Upload size={16} /> {uploading ? 'Uploading...' : 'Upload from device'}
      </button>
    </div>
  )
}

// ==================== HOMEPAGE ====================
function HomepageEditor({ showToast }: { showToast: any }) {
  const [form, setForm] = useState({ heroTitle: '', heroSubtitle: '', heroImageUrl: '', aboutText: '' })
  const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false)

  useEffect(() => {
    cmsApi.getHomepage().then((data) => {
      if (data) setForm({ heroTitle: data.heroTitle || '', heroSubtitle: data.heroSubtitle || '', heroImageUrl: data.heroImageUrl || '', aboutText: data.aboutText || '' })
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const save = async () => { setSaving(true); try { await cmsApi.updateHomepage(form); showToast('Homepage saved', 'success') } catch { showToast('Failed', 'error') }; setSaving(false) }
  if (loading) return <div className="text-theme-text opacity-50 text-center py-12">Loading...</div>

  return (
    <Card>
      <CardTitle className="mb-6">Homepage Content</CardTitle>
      <div className="space-y-4 max-w-2xl">
        <Input label="Hero Title" value={form.heroTitle} onChange={(e) => setForm({ ...form, heroTitle: e.target.value })} placeholder="The Yads Hood Hotel" />
        <Input label="Hero Subtitle" value={form.heroSubtitle} onChange={(e) => setForm({ ...form, heroSubtitle: e.target.value })} placeholder="Experience Luxury, Embrace Comfort" />
        <div><label className="block text-sm font-medium text-theme-text opacity-80 mb-1.5">Hero Image URL</label><div className="flex gap-2 items-end"><div className="flex-1"><Input value={form.heroImageUrl} onChange={(e) => setForm({ ...form, heroImageUrl: e.target.value })} placeholder="/hero-bg.png" /></div><ImageUploader onUpload={(url) => setForm({ ...form, heroImageUrl: url })} /></div></div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-theme-text opacity-80">About Text</label>
          <textarea value={form.aboutText} onChange={(e) => setForm({ ...form, aboutText: e.target.value })} className="h-32 w-full rounded-[14px] bg-theme-bg-card border border-theme p-4 text-theme-text placeholder:text-theme-muted outline-none focus:border-gold-500 resize-none" placeholder="Write about the hotel..." />
        </div>
        <Button variant="primary" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
      </div>
    </Card>
  )
}

// ==================== HERO SLIDES ====================
function HeroSlidesEditor({ showToast }: { showToast: any }) {
  const [slides, setSlides] = useState<any[]>([]); const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false); const [editing, setEditing] = useState<any>(null)

  const load = () => cmsApi.getHeroSlides().then(setSlides).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  return (
    <Card>
      <CardTitle className="mb-6">Background Slideshow</CardTitle>
      <p className="text-theme-text opacity-50 text-sm mb-4">Add multiple background images that will auto-change on the landing page.</p>
      {(showForm || editing) && <HeroSlideForm initial={editing} onClose={() => { setShowForm(false); setEditing(null) }} onSave={() => { setShowForm(false); setEditing(null); load() }} showToast={showToast} />}
      <div className="flex justify-end mb-4"><Button variant="primary" size="sm" onClick={() => setShowForm(true)}><Plus size={16} className="mr-1" /> Add Slide</Button></div>
      {loading ? <div className="text-theme-text opacity-50 text-center py-8">Loading...</div> : slides.length === 0 ? <p className="text-theme-text opacity-50 text-center py-8">No slides yet. Add background images that will rotate automatically.</p> : (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
          {slides.map((s) => (
            <div key={s.id} className="group relative rounded-[14px] overflow-hidden border border-theme bg-theme-surface">
              <div className="aspect-video bg-cover bg-center" style={{ backgroundImage: `url(${s.imageUrl})` }} />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                <button onClick={() => setEditing(s)} className="p-2 rounded-lg bg-gold-500/80 text-theme-text hover:bg-gold-500"><Pencil size={16} /></button>
                <button onClick={async () => { try { await cmsApi.deleteHeroSlide(s.id); load(); showToast('Slide deleted', 'success') } catch { showToast('Failed', 'error') } }} className="p-2 rounded-lg bg-danger/80 text-theme-text hover:bg-danger"><Trash2 size={16} /></button>
              </div>
              <div className="p-2">
                <p className="text-theme-text text-xs truncate">{s.title || 'No title'}</p>
                <Badge variant={s.active ? 'success' : 'default'} className="mt-1">{s.active ? 'Active' : 'Inactive'}</Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

function HeroSlideForm({ initial, onClose, onSave, showToast }: { initial: any; onClose: () => void; onSave: () => void; showToast: any }) {
  const [form, setForm] = useState({ imageUrl: initial?.imageUrl || '', title: initial?.title || '', subtitle: initial?.subtitle || '', sortOrder: initial?.sortOrder || 0, active: initial?.active ?? true })
  const [saving, setSaving] = useState(false)
  const save = async () => { setSaving(true); try { if (initial) await cmsApi.updateHeroSlide(initial.id, form); else await cmsApi.createHeroSlide(form); showToast(initial ? 'Updated' : 'Created', 'success'); onSave() } catch { showToast('Failed', 'error') }; setSaving(false) }
  return (
    <div className="mb-6 p-4 rounded-[14px] bg-gold-500/5 border border-gold-500/30">
      <div className="flex items-center justify-between mb-4"><h4 className="text-theme-text font-semibold">{initial ? 'Edit Slide' : 'New Slide'}</h4><button onClick={onClose} className="text-theme-text opacity-40 hover:text-theme-text"><X size={20} /></button></div>
      <div className="space-y-3">
        <div><label className="block text-sm font-medium text-theme-text opacity-80 mb-1.5">Image URL</label><div className="flex gap-2"><div className="flex-1"><Input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="/uploads/slide-1.jpg" /></div><ImageUploader onUpload={(url) => setForm({ ...form, imageUrl: url })} /></div></div>
        <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Welcome to The Yads Hood Hotel" />
        <Input label="Subtitle" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} placeholder="Experience Luxury" />
        <Input label="Sort Order" type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} />
        <div className="flex items-center gap-3"><label className="text-theme-text opacity-80 text-sm">Active</label><button onClick={() => setForm({ ...form, active: !form.active })} className={`w-12 h-6 rounded-full transition-all ${form.active ? 'bg-gold-500' : 'bg-theme-surface'}`}><div className={`w-5 h-5 rounded-full bg-white shadow-md transition-all ${form.active ? 'translate-x-6' : 'translate-x-0.5'}`} /></button></div>
        <div className="flex gap-2"><Button variant="primary" size="sm" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button><Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button></div>
      </div>
    </div>
  )
}

// ==================== PARTNERS ====================
function PartnersEditor({ showToast }: { showToast: any }) {
  const [items, setItems] = useState<any[]>([]); const [loading, setLoading] = useState(true); const [editing, setEditing] = useState<any>(null); const [showForm, setShowForm] = useState(false)
  const load = () => cmsApi.getPartners().then(setItems).finally(() => setLoading(false))
  useEffect(() => { load() }, [])
  return (
    <Card>
      <CardTitle className="mb-6">Partner Links</CardTitle>
      <p className="text-theme-text opacity-50 text-sm mb-4">Add links to partner sites. They will display the site name and logo on the landing page.</p>
      {(showForm || editing) && <PartnerForm initial={editing} onClose={() => { setShowForm(false); setEditing(null) }} onSave={() => { setShowForm(false); setEditing(null); load() }} showToast={showToast} />}
      <div className="flex justify-end mb-4"><Button variant="primary" size="sm" onClick={() => setShowForm(true)}><Plus size={16} className="mr-1" /> Add Link</Button></div>
      {loading ? <div className="text-theme-text opacity-50 text-center py-8">Loading...</div> : items.length === 0 ? <p className="text-theme-text opacity-50 text-center py-8">No partner links yet.</p> : (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
          {items.map((p) => (
            <div key={p.id} className="p-4 rounded-[14px] bg-theme-surface border border-theme text-center group relative">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-cover bg-center border border-theme" style={{ backgroundImage: `url(${p.logoUrl})` }} />
              <p className="text-theme-text font-medium text-sm">{p.name}</p>
              {p.websiteUrl && <p className="text-theme-text opacity-40 text-xs truncate">{p.websiteUrl}</p>}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <button onClick={() => setEditing(p)} className="p-1.5 rounded-lg bg-gold-500/80 text-theme-text"><Pencil size={14} /></button>
                <button onClick={async () => { try { await cmsApi.deletePartner(p.id); load(); showToast('Deleted', 'success') } catch { showToast('Failed', 'error') } }} className="p-1.5 rounded-lg bg-danger/80 text-theme-text"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

function PartnerForm({ initial, onClose, onSave, showToast }: { initial: any; onClose: () => void; onSave: () => void; showToast: any }) {
  const [form, setForm] = useState({ name: initial?.name || '', logoUrl: initial?.logoUrl || '', websiteUrl: initial?.websiteUrl || '', sortOrder: initial?.sortOrder || 0 })
  const [saving, setSaving] = useState(false)
  const save = async () => { setSaving(true); try { if (initial) await cmsApi.updatePartner(initial.id, form); else await cmsApi.createPartner(form); showToast(initial ? 'Updated' : 'Created', 'success'); onSave() } catch { showToast('Failed', 'error') }; setSaving(false) }
  return (
    <div className="mb-6 p-4 rounded-[14px] bg-gold-500/5 border border-gold-500/30">
      <div className="flex items-center justify-between mb-4"><h4 className="text-theme-text font-semibold">{initial ? 'Edit Partner' : 'Add Partner Link'}</h4><button onClick={onClose} className="text-theme-text opacity-40 hover:text-theme-text"><X size={20} /></button></div>
      <div className="space-y-3">
        <Input label="Site Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Booking.com" />
        <div><label className="block text-sm font-medium text-theme-text opacity-80 mb-1.5">Logo URL</label><div className="flex gap-2"><div className="flex-1"><Input value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} placeholder="https://example.com/logo.png" /></div><ImageUploader onUpload={(url) => setForm({ ...form, logoUrl: url })} /></div></div>
        <Input label="Website URL" value={form.websiteUrl} onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })} placeholder="https://booking.com" />
        <Input label="Sort Order" type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} />
        <div className="flex gap-2"><Button variant="primary" size="sm" onClick={save} disabled={saving || !form.name}>{saving ? 'Saving...' : 'Save'}</Button><Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button></div>
      </div>
    </div>
  )
}

// ==================== ROOM TYPES ====================
function RoomTypesEditor({ showToast }: { showToast: any }) {
  const [items, setItems] = useState<any[]>([]); const [loading, setLoading] = useState(true); const [editing, setEditing] = useState<any>(null); const [showForm, setShowForm] = useState(false)
  const load = () => cmsApi.getRoomTypes().then(setItems).finally(() => setLoading(false))
  useEffect(() => { load() }, [])
  return (
    <Card>
      <CardTitle className="mb-6">Room Types</CardTitle>
      <p className="text-theme-text opacity-50 text-sm mb-4">Manage room types (Deluxe, VIP, Executive, etc.). Each type becomes a card on the landing page with its image and info.</p>
      {(showForm || editing) && <RoomTypeForm initial={editing} onClose={() => { setShowForm(false); setEditing(null) }} onSave={() => { setShowForm(false); setEditing(null); load() }} showToast={showToast} />}
      <div className="flex justify-end mb-4"><Button variant="primary" size="sm" onClick={() => setShowForm(true)}><Plus size={16} className="mr-1" /> Add Room Type</Button></div>
      {loading ? <div className="text-theme-text opacity-50 text-center py-8">Loading...</div> : items.length === 0 ? <p className="text-theme-text opacity-50 text-center py-8">No room types yet.</p> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {items.map((r) => (
            <div key={r.id} className="rounded-[14px] bg-theme-surface border border-theme overflow-hidden group relative">
              <div className="h-40 bg-cover bg-center" style={{ backgroundImage: `url(${r.imageUrl || '/hero-bg.png'})` }} />
              <div className="p-4">
                <h4 className="text-theme-text font-semibold text-lg">{r.name}</h4>
                <p className="text-theme-text opacity-50 text-sm mt-1">{r.description || 'No description'}</p>
                <div className="flex items-center justify-between mt-3">
                  <p className="text-gold-500 font-bold">KSh {r.price?.toLocaleString()} <span className="text-theme-text opacity-40 text-xs font-normal">/night</span></p>
                  <Badge variant="info">{r.capacity} guests</Badge>
                </div>
                <p className="text-theme-text opacity-40 text-xs mt-2">{r._count?.rooms || 0} rooms</p>
              </div>
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <button onClick={() => setEditing(r)} className="p-1.5 rounded-lg bg-gold-500/80 text-theme-text"><Pencil size={14} /></button>
                <button onClick={async () => { try { await cmsApi.deleteRoomType(r.id); load(); showToast('Deleted', 'success') } catch { showToast('Failed', 'error') } }} className="p-1.5 rounded-lg bg-danger/80 text-theme-text"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

function RoomTypeForm({ initial, onClose, onSave, showToast }: { initial: any; onClose: () => void; onSave: () => void; showToast: any }) {
  const [form, setForm] = useState({ name: initial?.name || '', description: initial?.description || '', capacity: initial?.capacity || 2, price: initial?.price || 0, imageUrl: initial?.imageUrl || '', amenities: initial?.roomAmenities?.map((ra: any) => ra.amenity.name).join(', ') || '' })
  const [saving, setSaving] = useState(false)
  const save = async () => {
    setSaving(true)
    try {
      const payload = { ...form, amenities: form.amenities.split(',').map((s: string) => s.trim()).filter(Boolean) }
      if (initial) await cmsApi.updateRoomType(initial.id, payload); else await cmsApi.createRoomType(payload)
      showToast(initial ? 'Updated' : 'Created', 'success'); onSave()
    } catch { showToast('Failed', 'error') }; setSaving(false)
  }
  return (
    <div className="mb-6 p-4 rounded-[14px] bg-gold-500/5 border border-gold-500/30">
      <div className="flex items-center justify-between mb-4"><h4 className="text-theme-text font-semibold">{initial ? 'Edit Room Type' : 'New Room Type'}</h4><button onClick={onClose} className="text-theme-text opacity-40 hover:text-theme-text"><X size={20} /></button></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input label="Room Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Deluxe Room" />
        <Input label="Capacity" type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) || 1 })} />
        <Input label="Price (KSh)" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} />
        <div className="md:col-span-2"><label className="block text-sm font-medium text-theme-text opacity-80 mb-1.5">Image</label><div className="flex gap-2"><div className="flex-1"><Input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="/uploads/room.jpg" /></div><ImageUploader onUpload={(url) => setForm({ ...form, imageUrl: url })} /></div></div>
        <div className="md:col-span-2 space-y-1.5">
          <label className="block text-sm font-medium text-theme-text opacity-80">Description <span className="text-theme-text opacity-40 text-xs">(About this room)</span></label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="h-20 w-full rounded-[14px] bg-theme-bg-card border border-theme p-4 text-theme-text placeholder:text-theme-muted outline-none focus:border-gold-500 resize-none" placeholder="Room description and features..." />
        </div>
        <div className="md:col-span-2 space-y-1.5">
          <label className="block text-sm font-medium text-theme-text opacity-80">Amenities & Specialities <span className="text-theme-text opacity-40 text-xs">(comma-separated)</span></label>
          <textarea value={form.amenities} onChange={(e) => setForm({ ...form, amenities: e.target.value })} className="h-16 w-full rounded-[14px] bg-theme-bg-card border border-theme p-4 text-theme-text placeholder:text-theme-muted outline-none focus:border-gold-500 resize-none" placeholder="WiFi, TV, Air Conditioning, Room Service" />
        </div>
      </div>
      <div className="flex gap-2 mt-4"><Button variant="primary" size="sm" onClick={save} disabled={saving || !form.name}>{saving ? 'Saving...' : 'Save'}</Button><Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button></div>
    </div>
  )
}

// ==================== MENU ====================
function MenuEditor({ showToast }: { showToast: any }) {
  const [items, setItems] = useState<any[]>([]); const [loading, setLoading] = useState(true); const [editing, setEditing] = useState<any>(null); const [showForm, setShowForm] = useState(false)
  const load = () => cmsApi.getMenuItems().then(setItems).finally(() => setLoading(false))
  useEffect(() => { load() }, [])
  return (
    <Card>
      <CardTitle className="mb-6">Menu Items</CardTitle>
      <p className="text-theme-text opacity-50 text-sm mb-4">Manage restaurant menu items. Each item shows as a card with photo, description, and price on the public Restaurant page.</p>
      {(showForm || editing) && <MenuItemForm initial={editing} onClose={() => { setShowForm(false); setEditing(null) }} onSave={() => { setShowForm(false); setEditing(null); load() }} showToast={showToast} />}
      <div className="flex justify-end mb-4"><Button variant="primary" size="sm" onClick={() => setShowForm(true)}><Plus size={16} className="mr-1" /> Add Menu Item</Button></div>
      {loading ? <div className="text-theme-text opacity-50 text-center py-8">Loading...</div> : items.length === 0 ? <p className="text-theme-text opacity-50 text-center py-8">No menu items yet.</p> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {items.map((item) => (
            <div key={item.id} className="rounded-[14px] bg-theme-surface border border-theme overflow-hidden group relative">
              <div className="h-36 bg-cover bg-center" style={{ backgroundImage: `url(${item.imageUrl || ''})`, backgroundColor: item.imageUrl ? 'transparent' : '#0F221C' }} />
              <div className="p-4">
                <div className="flex items-start justify-between"><h4 className="text-theme-text font-semibold">{item.name}</h4><span className="text-gold-500 font-bold">KSh {item.price?.toLocaleString()}</span></div>
                <p className="text-theme-text opacity-50 text-sm mt-1">{item.description || ''}</p>
                <div className="flex gap-2 mt-2"><Badge variant="info">{item.category?.name || 'Uncategorized'}</Badge>{item.available !== false && <Badge variant="success">Available</Badge>}</div>
              </div>
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <button onClick={() => setEditing(item)} className="p-1.5 rounded-lg bg-gold-500/80 text-theme-text"><Pencil size={14} /></button>
                <button onClick={async () => { try { await cmsApi.deleteMenuItem(item.id); load(); showToast('Deleted', 'success') } catch { showToast('Failed', 'error') } }} className="p-1.5 rounded-lg bg-danger/80 text-theme-text"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

function MenuItemForm({ initial, onClose, onSave, showToast }: { initial: any; onClose: () => void; onSave: () => void; showToast: any }) {
  const [form, setForm] = useState({ name: initial?.name || '', description: initial?.description || '', price: initial?.price || 0, categoryId: initial?.categoryId || null as number | null, imageUrl: initial?.imageUrl || '', preparationTime: initial?.preparationTime || 0, ingredients: initial?.ingredients || '', calories: initial?.calories || 0, available: initial?.available ?? true })
  const [categories, setCategories] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  useEffect(() => { cmsApi.getRestaurantCategories().then(setCategories).catch(() => {}) }, [])
  const save = async () => { setSaving(true); try { if (initial) await cmsApi.updateMenuItem(initial.id, form); else await cmsApi.createMenuItem(form); showToast(initial ? 'Updated' : 'Created', 'success'); onSave() } catch { showToast('Failed', 'error') }; setSaving(false) }
  return (
    <div className="mb-6 p-4 rounded-[14px] bg-gold-500/5 border border-gold-500/30">
      <div className="flex items-center justify-between mb-4"><h4 className="text-theme-text font-semibold">{initial ? 'Edit Item' : 'New Menu Item'}</h4><button onClick={onClose} className="text-theme-text opacity-40 hover:text-theme-text"><X size={20} /></button></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nyama Choma" />
        <Input label="Price (KSh)" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} />
        <Select
          label="Category"
          value={String(form.categoryId || '')}
          onChange={(v) => setForm({ ...form, categoryId: v ? parseInt(v) : null })}
          options={[
            { value: '', label: 'Select category' },
            ...categories.map((c: any) => ({ value: String(c.id), label: c.name })),
          ]}
          placeholder="Select category"
        />
        <Input label="Preparation Time (min)" type="number" value={form.preparationTime} onChange={(e) => setForm({ ...form, preparationTime: parseInt(e.target.value) || 0 })} />
        <Input label="Calories" type="number" value={form.calories} onChange={(e) => setForm({ ...form, calories: parseInt(e.target.value) || 0 })} />
        <div className="md:col-span-2"><label className="block text-sm font-medium text-theme-text opacity-80 mb-1.5">Image</label><div className="flex gap-2"><div className="flex-1"><Input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="/uploads/meal.jpg" /></div><ImageUploader onUpload={(url) => setForm({ ...form, imageUrl: url })} /></div></div>
        <div className="md:col-span-2 space-y-1.5"><label className="block text-sm font-medium text-theme-text opacity-80">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="h-20 w-full rounded-[14px] bg-theme-bg-card border border-theme p-4 text-theme-text placeholder:text-theme-muted outline-none focus:border-gold-500 resize-none" /></div>
        <div className="md:col-span-2 space-y-1.5"><label className="block text-sm font-medium text-theme-text opacity-80">Ingredients</label><textarea value={form.ingredients} onChange={(e) => setForm({ ...form, ingredients: e.target.value })} className="h-16 w-full rounded-[14px] bg-theme-bg-card border border-theme p-4 text-theme-text placeholder:text-theme-muted outline-none focus:border-gold-500 resize-none" /></div>
        <div className="md:col-span-2 flex items-center gap-3"><label className="text-theme-text opacity-80 text-sm">Available</label><button onClick={() => setForm({ ...form, available: !form.available })} className={`w-12 h-6 rounded-full transition-all ${form.available ? 'bg-gold-500' : 'bg-theme-surface'}`}><div className={`w-5 h-5 rounded-full bg-white shadow-md transition-all ${form.available ? 'translate-x-6' : 'translate-x-0.5'}`} /></button></div>
      </div>
      <div className="flex gap-2 mt-4"><Button variant="primary" size="sm" onClick={save} disabled={saving || !form.name || !form.categoryId}>{saving ? 'Saving...' : 'Save'}</Button><Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button></div>
    </div>
  )
}

// ==================== EVENTS ====================
function EventsEditor({ showToast }: { showToast: any }) {
  const [items, setItems] = useState<any[]>([]); const [loading, setLoading] = useState(true); const [editing, setEditing] = useState<any>(null); const [showForm, setShowForm] = useState(false)
  const load = () => cmsApi.getEventPackages().then(setItems).finally(() => setLoading(false))
  useEffect(() => { load() }, [])
  return (
    <Card>
      <CardTitle className="mb-6">Event Packages</CardTitle>
      <p className="text-theme-text opacity-50 text-sm mb-4">Manage event packages. Each package has a photo, description, and price that displays on the public Events page.</p>
      {(showForm || editing) && <EventPackageForm initial={editing} onClose={() => { setShowForm(false); setEditing(null) }} onSave={() => { setShowForm(false); setEditing(null); load() }} showToast={showToast} />}
      <div className="flex justify-end mb-4"><Button variant="primary" size="sm" onClick={() => setShowForm(true)}><Plus size={16} className="mr-1" /> Add Event Package</Button></div>
      {loading ? <div className="text-theme-text opacity-50 text-center py-8">Loading...</div> : items.length === 0 ? <p className="text-theme-text opacity-50 text-center py-8">No event packages yet.</p> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4">
          {items.map((pkg) => (
            <div key={pkg.id} className="rounded-[14px] bg-theme-surface border border-theme overflow-hidden group relative">
              <div className="h-40 bg-cover bg-center" style={{ backgroundImage: `url(${pkg.imageUrl || '/hero-bg.png'})` }} />
              <div className="p-4">
                <div className="flex items-start justify-between"><h4 className="text-theme-text font-semibold text-lg">{pkg.name}</h4><span className="text-gold-500 font-bold">KSh {pkg.price?.toLocaleString()}</span></div>
                <p className="text-theme-text opacity-50 text-sm mt-1">{pkg.description || ''}</p>
                {pkg.hall && <Badge variant="info" className="mt-2">Hall: {pkg.hall.name}</Badge>}
              </div>
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <button onClick={() => setEditing(pkg)} className="p-1.5 rounded-lg bg-gold-500/80 text-theme-text"><Pencil size={14} /></button>
                <button onClick={async () => { try { await cmsApi.deleteEventPackage(pkg.id); load(); showToast('Deleted', 'success') } catch { showToast('Failed', 'error') } }} className="p-1.5 rounded-lg bg-danger/80 text-theme-text"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

function EventPackageForm({ initial, onClose, onSave, showToast }: { initial: any; onClose: () => void; onSave: () => void; showToast: any }) {
  const [form, setForm] = useState({ name: initial?.name || '', description: initial?.description || '', price: initial?.price || 0, imageUrl: initial?.imageUrl || '', hallId: initial?.hallId || null, maxGuests: initial?.maxGuests || initial?.hall?.capacity || '' })
  const [saving, setSaving] = useState(false)
  const save = async () => { setSaving(true); try { if (initial) await cmsApi.updateEventPackage(initial.id, form); else await cmsApi.createEventPackage(form); showToast(initial ? 'Updated' : 'Created', 'success'); onSave() } catch { showToast('Failed', 'error') }; setSaving(false) }
  return (
    <div className="mb-6 p-4 rounded-[14px] bg-gold-500/5 border border-gold-500/30">
      <div className="flex items-center justify-between mb-4"><h4 className="text-theme-text font-semibold">{initial ? 'Edit Package' : 'New Event Package'}</h4><button onClick={onClose} className="text-theme-text opacity-40 hover:text-theme-text"><X size={20} /></button></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input label="Package Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Wedding Package" />
        <Input label="Price (KSh)" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} />
        <Input label="Max Guests" type="number" value={form.maxGuests} onChange={(e) => setForm({ ...form, maxGuests: parseInt(e.target.value) || '' })} placeholder="100" />
        <div className="md:col-span-2"><label className="block text-sm font-medium text-theme-text opacity-80 mb-1.5">Image</label><div className="flex gap-2"><div className="flex-1"><Input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="/uploads/event.jpg" /></div><ImageUploader onUpload={(url) => setForm({ ...form, imageUrl: url })} /></div></div>
        <div className="md:col-span-2 space-y-1.5"><label className="block text-sm font-medium text-theme-text opacity-80">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="h-20 w-full rounded-[14px] bg-theme-bg-card border border-theme p-4 text-theme-text placeholder:text-theme-muted outline-none focus:border-gold-500 resize-none" /></div>
      </div>
      <div className="flex gap-2 mt-4"><Button variant="primary" size="sm" onClick={save} disabled={saving || !form.name}>{saving ? 'Saving...' : 'Save'}</Button><Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button></div>
    </div>
  )
}

// ==================== GALLERY ====================
function GalleryEditor({ showToast }: { showToast: any }) {
  const [images, setImages] = useState<any[]>([]); const [loading, setLoading] = useState(true); const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ imageUrl: '', altText: '', description: '', category: '' }); const [saving, setSaving] = useState(false)
  const load = () => cmsApi.getGallery().then(setImages).finally(() => setLoading(false))
  useEffect(() => { load() }, [])
  const handleUpload = async () => { if (!form.imageUrl) return; setSaving(true); try { await cmsApi.uploadImage(form); setForm({ imageUrl: '', altText: '', description: '', category: '' }); setShowForm(false); load(); showToast('Image added', 'success') } catch { showToast('Failed', 'error') }; setSaving(false) }
  const handleDelete = async (id: number) => { try { await cmsApi.deleteGalleryImage(id); load(); showToast('Deleted', 'success') } catch { showToast('Failed', 'error') } }
  const categories = [...new Set(images.map((i) => i.category).filter(Boolean))]
  return (
    <Card>
      <CardTitle className="mb-6">Gallery</CardTitle>
      <p className="text-theme-text opacity-50 text-sm mb-4">Upload gallery photos with descriptions. They display on the public Gallery page.</p>
      <div className="flex justify-end mb-4"><Button variant="primary" size="sm" onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : <><Plus size={16} className="mr-1" /> Add Photo</>}</Button></div>
      {showForm && (
        <div className="mb-6 p-4 rounded-[14px] bg-gold-500/5 border border-gold-500/30 space-y-3">
          <div><label className="block text-sm font-medium text-theme-text opacity-80 mb-1.5">Photo URL</label><div className="flex gap-2"><div className="flex-1"><Input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="/uploads/gallery.jpg" /></div><ImageUploader onUpload={(url) => setForm({ ...form, imageUrl: url })} /></div></div>
          <Input label="Alt Text" value={form.altText} onChange={(e) => setForm({ ...form, altText: e.target.value })} placeholder="Brief description" />
          <div className="space-y-1.5"><label className="block text-sm font-medium text-theme-text opacity-80">Full Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="h-20 w-full rounded-[14px] bg-theme-bg-card border border-theme p-4 text-theme-text placeholder:text-theme-muted outline-none focus:border-gold-500 resize-none" placeholder="Detailed description of this photo..." /></div>
          <Input label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="rooms, restaurant, events" />
          {categories.length > 0 && <div className="flex gap-2 flex-wrap">{categories.map((cat) => (<button key={cat} onClick={() => setForm({ ...form, category: cat })} className="px-3 py-1 rounded-full text-xs bg-theme-surface text-theme-text opacity-60 hover:bg-gold-500/20 hover:text-gold-500">{cat}</button>))}</div>}
          <Button variant="primary" size="sm" onClick={handleUpload} disabled={saving || !form.imageUrl}>{saving ? 'Adding...' : 'Add to Gallery'}</Button>
        </div>
      )}
      {loading ? <div className="text-theme-text opacity-50 text-center py-8">Loading...</div> : images.length === 0 ? <p className="text-theme-text opacity-50 text-center py-8">No photos yet.</p> : (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
          {images.map((img) => (
            <div key={img.id} className="group relative rounded-[14px] overflow-hidden border border-theme bg-theme-surface">
              <div className="aspect-square bg-cover bg-center" style={{ backgroundImage: `url(${img.imageUrl})` }} />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center"><button onClick={() => handleDelete(img.id)} className="p-2 rounded-lg bg-danger/80 text-theme-text"><Trash2 size={16} /></button></div>
              <div className="p-2"><p className="text-theme-text text-xs truncate">{img.altText || 'No description'}</p>{img.category && <Badge variant="gold" className="mt-1">{img.category}</Badge>}</div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

// ==================== FAQS ====================
function FaqEditor({ showToast }: { showToast: any }) {
  const [faqs, setFaqs] = useState<any[]>([]); const [loading, setLoading] = useState(true); const [editing, setEditing] = useState<any>(null); const [showForm, setShowForm] = useState(false)
  const load = () => cmsApi.getFaqs().then(setFaqs).finally(() => setLoading(false))
  useEffect(() => { load() }, [])
  return (
    <Card>
      <CardTitle className="mb-6">FAQs</CardTitle>
      {(showForm || editing) && <FaqForm initial={editing} onClose={() => { setShowForm(false); setEditing(null) }} onSave={() => { setShowForm(false); setEditing(null); load() }} showToast={showToast} />}
      <div className="flex justify-end mb-4"><Button variant="primary" size="sm" onClick={() => setShowForm(true)}><Plus size={16} className="mr-1" /> Add FAQ</Button></div>
      {loading ? <div className="text-theme-text opacity-50 text-center py-8">Loading...</div> : faqs.length === 0 ? <p className="text-theme-text opacity-50 text-center py-8">No FAQs yet.</p> : (
        <div className="space-y-3">{faqs.map((faq) => (
          <div key={faq.id} className="p-4 rounded-[14px] bg-theme-surface border border-theme">
            <div className="flex items-start justify-between gap-4"><div><p className="text-theme-text font-medium">{faq.question}</p><p className="text-theme-text opacity-50 text-sm mt-1">{faq.answer}</p><Badge variant="info" className="mt-2">Order: {faq.sortOrder}</Badge></div>
              <div className="flex gap-2 flex-shrink-0"><button onClick={() => setEditing(faq)} className="p-2 rounded-lg bg-theme-surface hover:bg-gold-500/20 text-theme-text opacity-60 hover:text-gold-500"><Pencil size={16} /></button><button onClick={async () => { try { await cmsApi.deleteFaq(faq.id); load(); showToast('Deleted', 'success') } catch { showToast('Failed', 'error') } }} className="p-2 rounded-lg bg-theme-surface hover:bg-danger/20 text-theme-text opacity-60 hover:text-danger"><Trash2 size={16} /></button></div>
            </div>
          </div>
        ))}</div>
      )}
    </Card>
  )
}

function FaqForm({ initial, onClose, onSave, showToast }: { initial: any; onClose: () => void; onSave: () => void; showToast: any }) {
  const [form, setForm] = useState({ question: initial?.question || '', answer: initial?.answer || '', sortOrder: initial?.sortOrder || 0 }); const [saving, setSaving] = useState(false)
  const save = async () => { setSaving(true); try { if (initial) await cmsApi.updateFaq(initial.id, form); else await cmsApi.createFaq(form); showToast(initial ? 'Updated' : 'Created', 'success'); onSave() } catch { showToast('Failed', 'error') }; setSaving(false) }
  return (
    <div className="mb-6 p-4 rounded-[14px] bg-gold-500/5 border border-gold-500/30">
      <div className="flex items-center justify-between mb-4"><h4 className="text-theme-text font-semibold">{initial ? 'Edit FAQ' : 'New FAQ'}</h4><button onClick={onClose} className="text-theme-text opacity-40 hover:text-theme-text"><X size={20} /></button></div>
      <div className="space-y-3">
        <Input label="Question" value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} placeholder="What are your check-in times?" />
        <div className="space-y-1.5"><label className="block text-sm font-medium text-theme-text opacity-80">Answer</label><textarea value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} className="h-24 w-full rounded-[14px] bg-theme-bg-card border border-theme p-4 text-theme-text placeholder:text-theme-muted outline-none focus:border-gold-500 resize-none" /></div>
        <Input label="Sort Order" type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} />
        <div className="flex gap-2"><Button variant="primary" size="sm" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button><Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button></div>
      </div>
    </div>
  )
}

// ==================== PROMOTIONS ====================
function PromotionsEditor({ showToast }: { showToast: any }) {
  const [items, setItems] = useState<any[]>([]); const [loading, setLoading] = useState(true); const [editing, setEditing] = useState<any>(null); const [showForm, setShowForm] = useState(false)
  const load = () => cmsApi.getPromotions().then(setItems).finally(() => setLoading(false))
  useEffect(() => { load() }, [])
  return (
    <Card>
      <CardTitle className="mb-6">Promotions</CardTitle>
      {(showForm || editing) && <PromotionForm initial={editing} onClose={() => { setShowForm(false); setEditing(null) }} onSave={() => { setShowForm(false); setEditing(null); load() }} showToast={showToast} />}
      <div className="flex justify-end mb-4"><Button variant="primary" size="sm" onClick={() => setShowForm(true)}><Plus size={16} className="mr-1" /> Add Promotion</Button></div>
      {loading ? <div className="text-theme-text opacity-50 text-center py-8">Loading...</div> : items.length === 0 ? <p className="text-theme-text opacity-50 text-center py-8">No promotions yet.</p> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4">{items.map((p) => (
          <div key={p.id} className="p-4 rounded-[14px] bg-theme-surface border border-theme">
            <div className="flex items-start justify-between gap-4"><div><p className="text-theme-text font-semibold">{p.title}</p>{p.description && <p className="text-theme-text opacity-50 text-sm mt-1">{p.description}</p>}
              <div className="flex gap-2 mt-2 flex-wrap">{p.discount && <Badge variant="gold">{p.discount}% OFF</Badge>}<Badge variant={p.active ? 'success' : 'default'}>{p.active ? 'Active' : 'Inactive'}</Badge><Badge variant="info">{new Date(p.startDate).toLocaleDateString()} - {new Date(p.endDate).toLocaleDateString()}</Badge></div>
            </div><div className="flex gap-2 flex-shrink-0"><button onClick={() => setEditing(p)} className="p-2 rounded-lg bg-theme-surface hover:bg-gold-500/20 text-theme-text opacity-60 hover:text-gold-500"><Pencil size={16} /></button><button onClick={async () => { try { await cmsApi.deletePromotion(p.id); load(); showToast('Deleted', 'success') } catch { showToast('Failed', 'error') } }} className="p-2 rounded-lg bg-theme-surface hover:bg-danger/20 text-theme-text opacity-60 hover:text-danger"><Trash2 size={16} /></button></div></div>
          </div>
        ))}</div>
      )}
    </Card>
  )
}

function PromotionForm({ initial, onClose, onSave, showToast }: { initial: any; onClose: () => void; onSave: () => void; showToast: any }) {
  const [form, setForm] = useState({ title: initial?.title || '', description: initial?.description || '', bannerUrl: initial?.bannerUrl || '', discount: initial?.discount || 0, startDate: initial?.startDate ? initial.startDate.slice(0, 10) : '', endDate: initial?.endDate ? initial.endDate.slice(0, 10) : '', active: initial?.active ?? true })
  const [saving, setSaving] = useState(false)
  const save = async () => { setSaving(true); try { if (initial) await cmsApi.updatePromotion(initial.id, form); else await cmsApi.createPromotion(form); showToast(initial ? 'Updated' : 'Created', 'success'); onSave() } catch { showToast('Failed', 'error') }; setSaving(false) }
  return (
    <div className="mb-6 p-4 rounded-[14px] bg-gold-500/5 border border-gold-500/30">
      <div className="flex items-center justify-between mb-4"><h4 className="text-theme-text font-semibold">{initial ? 'Edit Promotion' : 'New Promotion'}</h4><button onClick={onClose} className="text-theme-text opacity-40 hover:text-theme-text"><X size={20} /></button></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Summer Sale" />
        <Input label="Discount (%)" type="number" value={form.discount} onChange={(e) => setForm({ ...form, discount: parseInt(e.target.value) || 0 })} />
        <Input label="Start Date" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
        <Input label="End Date" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
        <div className="md:col-span-2"><label className="block text-sm font-medium text-theme-text opacity-80 mb-1.5">Banner Image</label><div className="flex gap-2"><div className="flex-1"><Input value={form.bannerUrl} onChange={(e) => setForm({ ...form, bannerUrl: e.target.value })} placeholder="/uploads/banner.jpg" /></div><ImageUploader onUpload={(url) => setForm({ ...form, bannerUrl: url })} /></div></div>
        <div className="md:col-span-2 space-y-1.5"><label className="block text-sm font-medium text-theme-text opacity-80">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="h-20 w-full rounded-[14px] bg-theme-bg-card border border-theme p-4 text-theme-text placeholder:text-theme-muted outline-none focus:border-gold-500 resize-none" /></div>
        <div className="md:col-span-2 flex items-center gap-3"><label className="text-theme-text opacity-80 text-sm">Active</label><button onClick={() => setForm({ ...form, active: !form.active })} className={`w-12 h-6 rounded-full transition-all ${form.active ? 'bg-gold-500' : 'bg-theme-surface'}`}><div className={`w-5 h-5 rounded-full bg-white shadow-md transition-all ${form.active ? 'translate-x-6' : 'translate-x-0.5'}`} /></button></div>
      </div>
      <div className="flex gap-2 mt-4"><Button variant="primary" size="sm" onClick={save} disabled={saving || !form.title}>{saving ? 'Saving...' : 'Save'}</Button><Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button></div>
    </div>
  )
}

// ==================== CONTACT INFO ====================
function ContactEditor({ showToast }: { showToast: any }) {
  const [items, setItems] = useState<any[]>([]); const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ phone: '', email: '', whatsapp: '', address: '', hours: '', socials: [{ label: '', url: '' }] })

  const load = () => cmsApi.getContactInfo().then((data) => {
    setItems(data)
    const map: Record<string, string> = {}
    data.forEach((i: any) => { map[i.type] = i.value })
    const socials = data.filter((i: any) => ['facebook', 'instagram', 'twitter', 'youtube', 'tiktok'].includes(i.type))
      .map((i: any) => ({ label: i.label || i.type, url: i.value }))
    setForm({
      phone: map['phone'] || '',
      email: map['email'] || '',
      whatsapp: map['whatsapp'] || '',
      address: map['address'] || '',
      hours: map['hours'] || '',
      socials: socials.length > 0 ? socials : [{ label: '', url: '' }],
    })
  }).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const upsertItem = async (type: string, value: string, label?: string) => {
    const existing = items.find((i: any) => i.type === type)
    try {
      if (existing) await cmsApi.updateContactInfo(existing.id, { type, value, label: label || type })
      else await cmsApi.createContactInfo({ type, value, label: label || type })
    } catch { showToast('Failed to save', 'error') }
  }

  const handleSave = async () => {
    setSaving(true)
    await Promise.all([
      upsertItem('phone', form.phone),
      upsertItem('email', form.email),
      upsertItem('whatsapp', form.whatsapp),
      upsertItem('address', form.address),
      upsertItem('hours', form.hours),
      ...form.socials.filter(s => s.label && s.url).map(s => upsertItem(s.label.toLowerCase().replace(/\s+/g, ''), s.url, s.label)),
    ])
    await load()
    setSaving(false)
    showToast('Contact info saved', 'success')
  }

  const addSocial = () => setForm({ ...form, socials: [...form.socials, { label: '', url: '' }] })
  const removeSocial = (i: number) => {
    const social = form.socials[i]
    if (social.label) {
      const existing = items.find((item: any) => item.type === social.label.toLowerCase().replace(/\s+/g, ''))
      if (existing) cmsApi.deleteContactInfo(existing.id).catch(() => {})
    }
    setForm({ ...form, socials: form.socials.filter((_, idx) => idx !== i) })
  }
  const updateSocial = (i: number, field: 'label' | 'url', value: string) => {
    const socials = [...form.socials]
    socials[i] = { ...socials[i], [field]: value }
    setForm({ ...form, socials })
  }

  if (loading) return <div className="text-white/50 text-center py-8">Loading...</div>

  return (
    <div className="page-container">
      <Card>
        <CardTitle className="mb-6">Contact Details</CardTitle>
        <p className="text-theme-text opacity-50 text-sm mb-6">Contact information shown on the Contact page and footer.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4 max-w-2xl">
          <PhoneInput label="Phone Number" required value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="712 345 678" />
          <Input label="Email Address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="info@yadshoodhotel.com" />
          <PhoneInput label="WhatsApp Number" required value={form.whatsapp} onChange={(v) => setForm({ ...form, whatsapp: v })} placeholder="712 345 678" />
          <Input label="Operating Hours" value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} placeholder="24/7 Reception & Customer Service" />
          <div className="md:col-span-2">
            <Input label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Kehancha, Migori County, Kenya" />
          </div>
        </div>
      </Card>

      <Card>
        <CardTitle className="mb-6">Social Media Links</CardTitle>
        <p className="text-theme-text opacity-50 text-sm mb-4">Social links appear in the footer. When clicked, they open the site in a new tab.</p>
        <div className="space-y-3 max-w-2xl">
          {form.socials.map((s, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-[14px] bg-theme-surface border border-theme">
              <div className="flex-1 space-y-2">
                <Input value={s.label} onChange={(e) => updateSocial(i, 'label', e.target.value)} placeholder="Facebook" />
                <Input value={s.url} onChange={(e) => updateSocial(i, 'url', e.target.value)} placeholder="https://facebook.com/yadshoodhotel" />
              </div>
              <button onClick={() => removeSocial(i)} className="p-2 rounded-lg bg-theme-surface hover:bg-danger/20 text-theme-text opacity-60 hover:text-danger transition-all mt-1"><Trash2 size={16} /></button>
            </div>
          ))}
          <Button variant="secondary" size="sm" onClick={addSocial}><Plus size={16} className="mr-1" /> Add Social Link</Button>
        </div>
      </Card>

      <div className="flex justify-end max-w-2xl">
        <Button variant="primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save All Changes'}</Button>
      </div>
    </div>
  )
}

// ==================== CONTACT SUBMISSIONS ====================
export function ContactSubmissions({ showToast }: { showToast: any }) {
  const [items, setItems] = useState<any[]>([]); const [loading, setLoading] = useState(true); const [filter, setFilter] = useState<string>('all')
  const [viewMsg, setViewMsg] = useState<any>(null)
  const load = () => cmsApi.getContactSubmissions(filter === 'unread' ? false : filter === 'read' ? true : undefined).then(setItems).finally(() => setLoading(false))
  useEffect(() => { load() }, [filter])
  const markRead = async (id: number) => { try { await cmsApi.markSubmissionRead(id); load() } catch { showToast('Failed', 'error') } }
  return (
    <Card>
      <CardTitle className="mb-4">Contact Form Submissions</CardTitle>
      <p className="text-theme-text opacity-50 text-sm mb-4">Messages sent from the public Contact page form appear here.</p>
      <div className="flex gap-2 mb-4">{['all', 'unread', 'read'].map((f) => (
        <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-[14px] text-sm font-medium transition-all ${filter === f ? 'bg-gold-500 text-forest-950' : 'bg-theme-surface text-theme-text opacity-60 hover:bg-theme-surface'}`}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
      ))}</div>
      {loading ? <div className="text-theme-text opacity-50 text-center py-8">Loading...</div> : items.length === 0 ? <p className="text-theme-text opacity-50 text-center py-8">No messages yet.</p> : (
        <div className="space-y-3">{items.map((s) => (
          <div key={s.id} onClick={() => { if (!s.read) markRead(s.id); setViewMsg(s) }} className={`p-4 rounded-[14px] border cursor-pointer transition-all ${s.read ? 'bg-theme-surface border-theme' : 'bg-gold-500/5 border-gold-500/30'}`}>
            <div className="flex items-start justify-between gap-4"><div><div className="flex items-center gap-2"><h4 className="text-theme-text font-semibold">{s.name}</h4>{!s.read && <Badge variant="gold">New</Badge>}</div>
              <div className="flex gap-3 text-sm text-theme-text opacity-50 mt-1">{s.email && <span>{s.email}</span>}{s.phone && <span>{s.phone}</span>}<span>{new Date(s.createdAt).toLocaleString()}</span></div>
              {s.subject && <p className="text-theme-text opacity-70 text-sm mt-1 font-medium">{s.subject}</p>}
              <p className="text-theme-text opacity-50 text-sm mt-1 line-clamp-2">{s.message}</p></div>
            <button onClick={async (e) => { e.stopPropagation(); try { await cmsApi.deleteSubmission(s.id); load(); showToast('Deleted', 'success') } catch { showToast('Failed', 'error') } }} className="p-2 rounded-lg bg-theme-surface hover:bg-danger/20 text-theme-text opacity-60 hover:text-danger flex-shrink-0"><Trash2 size={16} /></button></div>
          </div>
        ))}</div>
      )}
      {viewMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setViewMsg(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[22px] w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gold-500/20 flex items-center justify-center text-gold-500 font-bold text-lg">
                    {viewMsg.name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <h3 className="text-xl font-heading font-bold text-white">{viewMsg.name}</h3>
                    <p className="text-white/40 text-xs">{viewMsg.email}{viewMsg.phone ? ` · ${viewMsg.phone}` : ''}</p>
                  </div>
                </div>
                <button onClick={() => setViewMsg(null)} className="text-white/60 hover:text-white"><X size={20} /></button>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <Badge variant={viewMsg.read ? 'default' : 'gold'}>{viewMsg.read ? 'Read' : 'New'}</Badge>
                <span className="text-white/30 text-xs">{new Date(viewMsg.createdAt).toLocaleString()}</span>
              </div>
            </div>
            <div className="p-6 space-y-5">
              {viewMsg.subject && (
                <div className="p-3 rounded-xl bg-white/5">
                  <p className="text-white/40 text-xs mb-1">Subject</p>
                  <p className="text-white font-medium">{viewMsg.subject}</p>
                </div>
              )}
              <div>
                <p className="text-white/40 text-xs mb-2">Message</p>
                <div className="p-4 rounded-xl bg-white/5">
                  <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">{viewMsg.message}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-white/5">
                  <p className="text-white/40 text-xs mb-1">Email</p>
                  <p className="text-white font-medium break-all">{viewMsg.email || '—'}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5">
                  <p className="text-white/40 text-xs mb-1">Phone</p>
                  <p className="text-white font-medium text-sm">{viewMsg.phone || '—'}</p>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="secondary" className="flex-1" onClick={() => { setViewMsg(null) }}>Close</Button>
                <Button variant="secondary" onClick={async (e) => { e.stopPropagation(); try { await cmsApi.deleteSubmission(viewMsg.id); setViewMsg(null); load(); showToast('Deleted', 'success') } catch { showToast('Failed', 'error') } }}>
                  <Trash2 size={16} /> Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}

// ==================== SEO ====================
function SeoEditor({ showToast }: { showToast: any }) {
  const [form, setForm] = useState({ pageSlug: 'home', metaTitle: '', metaDescription: '', keywords: '', ogImageUrl: '', canonicalUrl: '' })
  const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false)
  useEffect(() => { cmsApi.getSeo('home').then((data) => { if (data) setForm({ pageSlug: data.pageSlug, metaTitle: data.metaTitle || '', metaDescription: data.metaDescription || '', keywords: data.keywords || '', ogImageUrl: data.ogImageUrl || '', canonicalUrl: data.canonicalUrl || '' }) }).finally(() => setLoading(false)) }, [])
  const save = async () => { setSaving(true); try { await cmsApi.upsertSeo(form); showToast('SEO saved', 'success') } catch { showToast('Failed', 'error') }; setSaving(false) }
  if (loading) return <div className="text-theme-text opacity-50 text-center py-8">Loading...</div>
  return (
    <Card><CardTitle className="mb-6">SEO Settings</CardTitle><div className="space-y-4 max-w-lg">
      <Input label="Page Slug" value={form.pageSlug} onChange={(e) => setForm({ ...form, pageSlug: e.target.value })} placeholder="home" />
      <Input label="Meta Title" value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} placeholder="The Yads Hood Hotel - Luxury Accommodation" />
      <Input label="Meta Description" value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} placeholder="Experience luxury and comfort..." />
      <Input label="Keywords" value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })} placeholder="hotel, luxury, accommodation" />
      <Input label="OG Image URL" value={form.ogImageUrl} onChange={(e) => setForm({ ...form, ogImageUrl: e.target.value })} placeholder="https://example.com/og-image.jpg" />
      <Input label="Canonical URL" value={form.canonicalUrl} onChange={(e) => setForm({ ...form, canonicalUrl: e.target.value })} placeholder="https://yadshoodhotel.com/" />
      <Button variant="primary" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save SEO Settings'}</Button>
    </div></Card>
  )
}

// ==================== THEME ====================
function ThemeEditor({ showToast }: { showToast: any }) {
  const { theme, setTheme } = useUIStore()

  const themes = [
    { value: 'forest', label: 'Forest (Default)', desc: 'Forest green with gold accents' },
    { value: 'light', label: 'Light', desc: 'Green-tinted white with subtle shadows' },
  ]

  const handleSelect = (value: string) => {
    setTheme(value as any)
    showToast(`Theme set to ${themes.find(t => t.value === value)?.label}`, 'success')
  }

  return (
    <Card>
      <CardTitle className="mb-6">Website Theme</CardTitle>
      <p className="text-theme-text opacity-50 text-sm mb-6">Choose the website color theme. Changes apply immediately.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4 max-w-2xl">
        {themes.map((t) => (
          <div
            key={t.value}
            onClick={() => handleSelect(t.value)}
            className={`p-6 rounded-[14px] border-2 cursor-pointer transition-all duration-300 ${
              theme === t.value
                ? 'border-theme-accent bg-theme-accent/10'
                : 'border-theme hover:border-theme-accent/50'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-theme-text font-semibold">{t.label}</h4>
              {theme === t.value && <Badge variant="gold">Active</Badge>}
            </div>
            <p className="text-theme-text opacity-50 text-sm mb-4">{t.desc}</p>
            <div className="flex gap-2">
              <div className={`w-6 h-6 rounded-full ${
                t.value === 'forest' ? 'bg-forest-900' :
                'bg-[#DEEAE2]'
              }`} />
              <div className={`w-6 h-6 rounded-full ${
                t.value === 'forest' ? 'bg-gold-500' :
                'bg-[#D4AF37]'
              }`} />
              <div className={`w-6 h-6 rounded-full ${
                t.value === 'forest' ? 'bg-forest-950' :
                'bg-[#F2F7F4]'
              }`} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

// ==================== RESTAURANT ORDERS ====================
export function RestaurantOrdersEditor({ showToast }: { showToast: any }) {
  const [orders, setOrders] = useState<any[]>([]); const [loading, setLoading] = useState(true)
  const load = () => cmsApi.getRestaurantOrders().then(setOrders).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const updateStatus = async (id: number, status: string) => {
    try { await cmsApi.updateRestaurantOrderStatus(id, status); showToast('Status updated', 'success'); load() }
    catch { showToast('Failed to update', 'error') }
  }

  const deleteOrder = async (id: number) => {
    if (!confirm('Delete this order?')) return
    try { await cmsApi.deleteRestaurantOrder(id); showToast('Deleted', 'success'); load() }
    catch { showToast('Failed to delete', 'error') }
  }

  if (loading) return <div className="text-white/50 text-center py-8">Loading...</div>

  return (
    <Card>
      <CardTitle className="mb-6">Restaurant Orders & Reservations</CardTitle>
      <p className="text-theme-text opacity-50 text-sm mb-6">Table reservations and orders from the restaurant page.</p>
      {orders.length === 0 ? (
        <p className="text-white/50 text-center py-8">No orders or reservations yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-theme text-theme-text opacity-50">
                <th className="pb-3 font-medium">Order #</th>
                <th className="pb-3 font-medium">Customer</th>
                <th className="pb-3 font-medium">Details</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-theme text-theme-text">
                  <td className="py-3 font-medium">{o.orderNumber}</td>
                  <td className="py-3">{o.customerName || '—'}</td>
                  <td className="py-3 text-xs opacity-60 max-w-[200px] truncate">{o.notes || '—'}</td>
                  <td className="py-3">
                    <Select
                      value={o.status}
                      onChange={(v) => updateStatus(o.id, v)}
                      options={[
                        { value: 'PENDING', label: 'Pending' },
                        { value: 'CONFIRMED', label: 'Confirmed' },
                        { value: 'PREPARING', label: 'Preparing' },
                        { value: 'SERVED', label: 'Served' },
                        { value: 'COMPLETED', label: 'Completed' },
                        { value: 'CANCELLED', label: 'Cancelled' },
                      ]}
                      placeholder="Status"
                    />
                  </td>
                  <td className="py-3 text-xs opacity-60">{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td className="py-3">
                    <button onClick={() => deleteOrder(o.id)} className="text-danger hover:opacity-80"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}

function FilesManager({ showToast }: { showToast: any }) {
  const [files, setFiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [typeFilter, setTypeFilter] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const limit = 50

  const load = async (p = page, type = typeFilter) => {
    setLoading(true)
    try {
      const params: any = { page: p, limit }
      if (type) params.mimeType = type
      const r = await cmsApi.getFiles(params)
      setFiles(r.data || [])
      setTotal(r.total || 0)
    } catch { showToast('Failed to load files', 'error') }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await cmsApi.uploadFile(file)
      showToast(`Uploaded ${res.originalName}`, 'success')
      load()
    } catch { showToast('Upload failed', 'error') }
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  const remove = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    try {
      await cmsApi.deleteFile(id)
      showToast('Deleted', 'success')
      load()
    } catch { showToast('Failed to delete', 'error') }
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / 1048576).toFixed(1) + ' MB'
  }

  const getTypeIcon = (mime: string) => {
    if (mime.startsWith('image/')) return '\u{1F5BC}'
    if (mime === 'application/pdf') return '\u{1F4C4}'
    if (mime.includes('word')) return '\u{1F4DD}'
    if (mime.includes('spreadsheet') || mime.includes('excel')) return '\u{1F4CA}'
    if (mime.includes('presentation') || mime.includes('powerpoint')) return '\u{1F4CA}'
    if (mime === 'text/plain') return '\u{1F4C4}'
    if (mime.includes('zip') || mime.includes('rar')) return '\u{1F4E6}'
    return '\u{1F4C1}'
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <div>
          <CardTitle>File Manager</CardTitle>
          <p className="text-theme-text opacity-50 text-sm mt-1">{total} files stored</p>
        </div>
        <div className="flex gap-2">
          <input ref={fileRef} type="file" className="hidden" onChange={handleUpload} />
          <Button variant="primary" onClick={() => fileRef.current?.click()} disabled={uploading}>
            <Upload size={16} /> {uploading ? 'Uploading...' : 'Upload File'}
          </Button>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {['', 'image', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml'].map((t) => (
          <button key={t} onClick={() => { setTypeFilter(t); setPage(1); load(1, t) }}
            className={`px-3 py-1.5 rounded-[10px] text-xs font-medium transition-all ${typeFilter === t ? 'bg-gold-500 text-black' : 'bg-theme-surface text-theme-text opacity-60 hover:opacity-100'}`}>
            {t === '' ? 'All' : t === 'image' ? 'Images' : t.includes('pdf') ? 'PDFs' : 'Documents'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-theme-text opacity-50">Loading...</div>
      ) : files.length === 0 ? (
        <div className="text-center py-12 text-theme-text opacity-50">No files uploaded yet.</div>
      ) : (
        <div className="space-y-2">
          {files.map((f: any) => (
            <div key={f.id} className="flex items-center gap-3 p-3 rounded-[12px] bg-theme-surface border border-theme hover:border-gold-500/30 transition-all">
              <span className="text-xl">{getTypeIcon(f.mimeType)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-theme-text font-medium text-sm truncate">{f.originalName}</p>
                <p className="text-xs text-theme-text opacity-50">
                  {formatSize(f.size)} &middot; {f.mimeType}
                  {f.relatedType && ` \u00B7 ${f.relatedType} #${f.relatedId}`}
                </p>
              </div>
              <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-xs text-gold-500 hover:underline shrink-0">Open</a>
              <button onClick={() => remove(f.id, f.originalName)} className="text-danger hover:opacity-80 shrink-0"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button onClick={() => { setPage(p => Math.max(1, p - 1)); load(page - 1) }} disabled={page === 1}
            className="px-3 py-1.5 rounded-[10px] bg-theme-surface text-theme-text text-xs disabled:opacity-30">Previous</button>
          <span className="px-3 py-1.5 text-theme-text text-xs">{page} / {totalPages}</span>
          <button onClick={() => { setPage(p => Math.min(totalPages, p + 1)); load(page + 1) }} disabled={page === totalPages}
            className="px-3 py-1.5 rounded-[10px] bg-theme-surface text-theme-text text-xs disabled:opacity-30">Next</button>
        </div>
      )}
    </Card>
  )
}
