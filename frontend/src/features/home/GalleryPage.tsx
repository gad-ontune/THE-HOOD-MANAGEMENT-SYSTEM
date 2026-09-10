import { useState, useEffect } from 'react'
import { publicApi } from '@/services/publicApi'

export default function GalleryPage() {
  const [gallery, setGallery] = useState<any>({ images: [], categories: [] })
  const [activeCategory, setActiveCategory] = useState('All')
  const [loading, setLoading] = useState(true)
  const [selectedImg, setSelectedImg] = useState<any>(null)

  useEffect(() => {
    publicApi.getGallery().then(setGallery).finally(() => setLoading(false))
  }, [])

  const filtered = activeCategory === 'All'
    ? gallery.images
    : gallery.images.filter((img: any) => img.category === activeCategory)

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
          <h1 className="text-4xl md:text-6xl font-heading font-bold text-white mb-4">Gallery</h1>
          <p className="text-lg text-white/70">Explore The Yads Hood Hotel through our photo gallery</p>
        </div>
      </section>

      <section className="py-12 px-6 lg:px-20 xl:px-32 max-w-[1600px] mx-auto">
        {gallery.categories.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-10">
            <button onClick={() => setActiveCategory('All')}
              className={`px-6 py-2 rounded-full border transition-all duration-300 text-sm xl:text-base font-medium ${activeCategory === 'All' ? 'bg-gold-500 text-forest-950 border-gold-500' : 'border-gold-500/30 text-gold-500 hover:bg-gold-500/20'}`}>All</button>
            {gallery.categories.map((cat: string) => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2 rounded-full border transition-all duration-300 text-sm xl:text-base font-medium ${activeCategory === cat ? 'bg-gold-500 text-forest-950 border-gold-500' : 'border-gold-500/30 text-gold-500 hover:bg-gold-500/20'}`}>{cat}</button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-theme-text opacity-50 text-lg xl:text-xl">No images in this category yet.</p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
            {filtered.map((img: any) => (
              <div key={img.id} className="break-inside-avoid overflow-hidden rounded-[24px] group cursor-pointer" onClick={() => setSelectedImg(img)}>
                <img src={img.imageUrl} alt={img.altText || ''} className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105 rounded-[24px]" />
                <div className="p-3">
                  {img.altText && <p className="text-theme-text font-medium text-sm xl:text-base">{img.altText}</p>}
                  {img.description && <p className="text-theme-text opacity-50 text-xs xl:text-sm mt-1">{img.description}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {selectedImg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelectedImg(null)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
          <div className="relative max-w-3xl max-h-[90vh] rounded-[22px] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <img src={selectedImg.imageUrl} alt={selectedImg.altText || ''} className="w-full h-auto max-h-[75vh] object-contain" />
            <div className="p-4 bg-black/60">
              {selectedImg.altText && <p className="text-white font-medium">{selectedImg.altText}</p>}
              {selectedImg.description && <p className="text-white/60 text-sm mt-1">{selectedImg.description}</p>}
            </div>
            <button onClick={() => setSelectedImg(null)} className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 rounded-full p-2 text-white"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
          </div>
        </div>
      )}
    </div>
  )
}
