import api from './api'

export const publicApi = {
  getHomepage: () => api.get('/public/homepage').then(r => r.data),
  getHeroSlides: () => api.get('/public/hero-slides').then(r => r.data),
  getPartners: () => api.get('/public/partners').then(r => r.data),
  getRooms: () => api.get('/public/rooms').then(r => r.data),
  getRoom: (id: number) => api.get(`/public/rooms/${id}`).then(r => r.data),
  getMenu: () => api.get('/public/restaurant/menu').then(r => r.data),
  getEventPackages: () => api.get('/public/events/packages').then(r => r.data),
  getGallery: () => api.get('/public/gallery').then(r => r.data),
  getTestimonials: () => api.get('/public/testimonials').then(r => r.data),
  getFaqs: () => api.get('/public/faqs').then(r => r.data),
  getContact: () => api.get('/public/contact').then(r => r.data),
  getPromotions: () => api.get('/public/promotions').then(r => r.data),
  submitContact: (data: any) => api.post('/public/contact/submit', data).then(r => r.data),
  reserveTable: (data: any) => api.post('/public/restaurant/reserve', data).then(r => r.data),
  bookRoom: (data: any) => api.post('/public/book', data).then(r => r.data),
  bookEvent: (data: any) => api.post('/public/events/book', data).then(r => r.data),
  getPaymentSettings: () => api.get('/public/payment-settings').then(r => r.data),
}

export const cmsApi = {
  // Upload
  uploadFile: (file: File) => {
    const fd = new FormData()
    fd.append('file', file)
    return api.post('/cms/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data)
  },

  // Homepage
  getHomepage: () => api.get('/cms/homepage').then(r => r.data),
  updateHomepage: (data: any) => api.put('/cms/homepage', data).then(r => r.data),

  // Hero Slides
  getHeroSlides: () => api.get('/cms/hero-slides').then(r => r.data),
  createHeroSlide: (data: any) => api.post('/cms/hero-slides', data).then(r => r.data),
  updateHeroSlide: (id: number, data: any) => api.put(`/cms/hero-slides/${id}`, data).then(r => r.data),
  deleteHeroSlide: (id: number) => api.delete(`/cms/hero-slides/${id}`).then(r => r.data),

  // Partners
  getPartners: () => api.get('/cms/partners').then(r => r.data),
  createPartner: (data: any) => api.post('/cms/partners', data).then(r => r.data),
  updatePartner: (id: number, data: any) => api.put(`/cms/partners/${id}`, data).then(r => r.data),
  deletePartner: (id: number) => api.delete(`/cms/partners/${id}`).then(r => r.data),

  // Gallery
  getGallery: () => api.get('/cms/gallery').then(r => r.data),
  uploadImage: (data: any) => api.post('/cms/gallery', data).then(r => r.data),
  updateGalleryImage: (id: number, data: any) => api.put(`/cms/gallery/${id}`, data).then(r => r.data),
  deleteGalleryImage: (id: number) => api.delete(`/cms/gallery/${id}`).then(r => r.data),

  // Promotions
  getPromotions: () => api.get('/cms/promotions').then(r => r.data),
  createPromotion: (data: any) => api.post('/cms/promotions', data).then(r => r.data),
  updatePromotion: (id: number, data: any) => api.put(`/cms/promotions/${id}`, data).then(r => r.data),
  deletePromotion: (id: number) => api.delete(`/cms/promotions/${id}`).then(r => r.data),

  // FAQs
  getFaqs: () => api.get('/cms/faqs').then(r => r.data),
  createFaq: (data: any) => api.post('/cms/faqs', data).then(r => r.data),
  updateFaq: (id: number, data: any) => api.put(`/cms/faqs/${id}`, data).then(r => r.data),
  deleteFaq: (id: number) => api.delete(`/cms/faqs/${id}`).then(r => r.data),

  // Contact Info
  getContactInfo: () => api.get('/cms/contact').then(r => r.data),
  createContactInfo: (data: any) => api.post('/cms/contact', data).then(r => r.data),
  updateContactInfo: (id: number, data: any) => api.put(`/cms/contact/${id}`, data).then(r => r.data),
  deleteContactInfo: (id: number) => api.delete(`/cms/contact/${id}`).then(r => r.data),

  // Contact Submissions
  getContactSubmissions: (read?: boolean) => api.get('/cms/contact-submissions', { params: { read } }).then(r => r.data),
  markSubmissionRead: (id: number) => api.put(`/cms/contact-submissions/${id}/read`).then(r => r.data),
  deleteSubmission: (id: number) => api.delete(`/cms/contact-submissions/${id}`).then(r => r.data),

  // SEO
  getSeo: (pageSlug?: string) => api.get('/cms/seo', { params: { pageSlug } }).then(r => r.data),
  upsertSeo: (data: any) => api.put('/cms/seo', data).then(r => r.data),

  // Room Types (CMS)
  getRoomTypes: () => api.get('/cms/room-types').then(r => r.data),
  createRoomType: (data: any) => api.post('/cms/room-types', data).then(r => r.data),
  updateRoomType: (id: number, data: any) => api.put(`/cms/room-types/${id}`, data).then(r => r.data),
  deleteRoomType: (id: number) => api.delete(`/cms/room-types/${id}`).then(r => r.data),

  // Menu Items (CMS)
  getMenuItems: () => api.get('/cms/menu-items').then(r => r.data),
  createMenuItem: (data: any) => api.post('/cms/menu-items', data).then(r => r.data),
  updateMenuItem: (id: number, data: any) => api.put(`/cms/menu-items/${id}`, data).then(r => r.data),
  deleteMenuItem: (id: number) => api.delete(`/cms/menu-items/${id}`).then(r => r.data),

  // Event Packages (CMS)
  getEventPackages: () => api.get('/cms/event-packages').then(r => r.data),
  createEventPackage: (data: any) => api.post('/cms/event-packages', data).then(r => r.data),
  updateEventPackage: (id: number, data: any) => api.put(`/cms/event-packages/${id}`, data).then(r => r.data),
  deleteEventPackage: (id: number) => api.delete(`/cms/event-packages/${id}`).then(r => r.data),

  // Restaurant Categories (CMS)
  getRestaurantCategories: () => api.get('/cms/restaurant-categories').then(r => r.data),
  createRestaurantCategory: (data: any) => api.post('/cms/restaurant-categories', data).then(r => r.data),
  deleteRestaurantCategory: (id: number) => api.delete(`/cms/restaurant-categories/${id}`).then(r => r.data),

  // Restaurant Orders (CMS)
  getRestaurantOrders: () => api.get('/cms/restaurant-orders').then(r => r.data),
  updateRestaurantOrderStatus: (id: number, status: string) => api.put(`/cms/restaurant-orders/${id}/status`, { status }).then(r => r.data),
  deleteRestaurantOrder: (id: number) => api.delete(`/cms/restaurant-orders/${id}`).then(r => r.data),

  // Notifications (CMS)
  getNotifications: () => api.get('/cms/notifications').then(r => r.data),

  // Files (CMS)
  getFiles: (params?: any) => api.get('/cms/files', { params }).then(r => r.data),
  getFile: (id: number) => api.get(`/cms/files/${id}`).then(r => r.data),
  deleteFile: (id: number) => api.delete(`/cms/files/${id}`).then(r => r.data),
}
