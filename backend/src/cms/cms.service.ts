import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class CmsService {
  constructor(private prisma: PrismaService) {}

  // ==================== HOMEPAGE ====================

  async getHomepage() {
    return this.prisma.homepageContent.findFirst();
  }

  async updateHomepage(data: any) {
    const existing = await this.prisma.homepageContent.findFirst();
    if (existing) {
      return this.prisma.homepageContent.update({ where: { id: existing.id }, data });
    }
    return this.prisma.homepageContent.create({ data });
  }

  // ==================== HERO SLIDES ====================

  async getHeroSlides() {
    return this.prisma.heroSlide.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  async createHeroSlide(data: { imageUrl: string; title?: string; subtitle?: string; sortOrder?: number; active?: boolean }) {
    return this.prisma.heroSlide.create({ data });
  }

  async updateHeroSlide(id: number, data: { imageUrl?: string; title?: string; subtitle?: string; sortOrder?: number; active?: boolean }) {
    return this.prisma.heroSlide.update({ where: { id }, data });
  }

  async deleteHeroSlide(id: number) {
    return this.prisma.heroSlide.delete({ where: { id } });
  }

  // ==================== PARTNERS ====================

  async getPartners() {
    return this.prisma.partner.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  async createPartner(data: { name: string; logoUrl: string; websiteUrl?: string; sortOrder?: number }) {
    return this.prisma.partner.create({ data });
  }

  async updatePartner(id: number, data: { name?: string; logoUrl?: string; websiteUrl?: string; sortOrder?: number }) {
    return this.prisma.partner.update({ where: { id }, data });
  }

  async deletePartner(id: number) {
    return this.prisma.partner.delete({ where: { id } });
  }

  // ==================== GALLERY ====================

  async getGallery() {
    return this.prisma.galleryImage.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  async uploadImage(data: { imageUrl: string; altText?: string; category?: string }) {
    return this.prisma.galleryImage.create({ data });
  }

  async updateGalleryImage(id: number, data: { altText?: string; category?: string; sortOrder?: number }) {
    return this.prisma.galleryImage.update({ where: { id }, data });
  }

  async deleteGalleryImage(id: number) {
    return this.prisma.galleryImage.delete({ where: { id } });
  }

  // ==================== PROMOTIONS ====================

  async getPromotions() {
    return this.prisma.promotion.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async createPromotion(data: {
    title: string;
    description?: string;
    bannerUrl?: string;
    discount?: number;
    startDate: string;
    endDate: string;
    active?: boolean;
  }) {
    return this.prisma.promotion.create({
      data: {
        title: data.title,
        description: data.description,
        bannerUrl: data.bannerUrl,
        discount: data.discount,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        active: data.active ?? true,
      },
    });
  }

  async updatePromotion(id: number, data: any) {
    const updateData: any = { ...data };
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);
    return this.prisma.promotion.update({ where: { id }, data: updateData });
  }

  async deletePromotion(id: number) {
    return this.prisma.promotion.delete({ where: { id } });
  }

  // ==================== FAQS ====================

  async getFaqs() {
    return this.prisma.faq.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  async createFaq(data: { question: string; answer: string; sortOrder?: number }) {
    return this.prisma.faq.create({ data });
  }

  async updateFaq(id: number, data: { question?: string; answer?: string; sortOrder?: number }) {
    return this.prisma.faq.update({ where: { id }, data });
  }

  async deleteFaq(id: number) {
    return this.prisma.faq.delete({ where: { id } });
  }

  // ==================== CONTACT INFORMATION ====================

  async getContactInfo() {
    return this.prisma.contactInformation.findMany();
  }

  async upsertContactInfo(id: number | null, data: { type: string; value: string; label?: string }) {
    if (id) {
      return this.prisma.contactInformation.update({ where: { id }, data });
    }
    return this.prisma.contactInformation.create({ data });
  }

  async deleteContactInfo(id: number) {
    return this.prisma.contactInformation.delete({ where: { id } });
  }

  // ==================== CONTACT SUBMISSIONS ====================

  async getContactSubmissions(read?: boolean) {
    const where: any = {};
    if (read !== undefined) where.read = read;
    return this.prisma.contactSubmission.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  async markSubmissionRead(id: number) {
    return this.prisma.contactSubmission.update({ where: { id }, data: { read: true } });
  }

  async deleteSubmission(id: number) {
    return this.prisma.contactSubmission.delete({ where: { id } });
  }

  // ==================== SEO ====================

  async getSeo(pageSlug?: string) {
    if (pageSlug) {
      return this.prisma.seo.findUnique({ where: { pageSlug } });
    }
    return this.prisma.seo.findMany();
  }

  async upsertSeo(data: { pageSlug: string; metaTitle?: string; metaDescription?: string; keywords?: string; ogImageUrl?: string; canonicalUrl?: string }) {
    return this.prisma.seo.upsert({
      where: { pageSlug: data.pageSlug },
      update: data,
      create: data,
    });
  }

  // ==================== ROOM TYPES ====================

  async getRoomTypes() {
    return this.prisma.roomType.findMany({
      include: { _count: { select: { rooms: true } }, roomAmenities: { include: { amenity: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createRoomType(data: { name: string; description?: string; capacity: number; price: number; imageUrl?: string; amenities?: string[] }) {
    const { amenities, ...rest } = data;
    const roomType = await this.prisma.roomType.create({ data: rest });
    if (amenities?.length) {
      for (const name of amenities) {
        const amenity = await this.prisma.amenity.upsert({ where: { name }, update: {}, create: { name } });
        await this.prisma.roomTypeAmenity.create({ data: { roomTypeId: roomType.id, amenityId: amenity.id } });
      }
    }
    return roomType;
  }

  async updateRoomType(id: number, data: { name?: string; description?: string; capacity?: number; price?: number; imageUrl?: string; amenities?: string[] }) {
    const { amenities, ...rest } = data;
    const roomType = await this.prisma.roomType.update({ where: { id }, data: rest });
    if (amenities) {
      await this.prisma.roomTypeAmenity.deleteMany({ where: { roomTypeId: id } });
      for (const name of amenities) {
        const amenity = await this.prisma.amenity.upsert({ where: { name }, update: {}, create: { name } });
        await this.prisma.roomTypeAmenity.create({ data: { roomTypeId: id, amenityId: amenity.id } });
      }
    }
    return roomType;
  }

  async deleteRoomType(id: number) {
    return this.prisma.roomType.delete({ where: { id } });
  }

  // ==================== MENU ITEMS ====================

  async getMenuItems() {
    return this.prisma.restaurantMenuItem.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createMenuItem(data: {
    name: string;
    description?: string;
    price: number;
    categoryId: number;
    imageUrl?: string;
    preparationTime?: number;
    ingredients?: string;
    calories?: number;
    available?: boolean;
  }) {
    return this.prisma.restaurantMenuItem.create({ data });
  }

  async updateMenuItem(id: number, data: any) {
    return this.prisma.restaurantMenuItem.update({ where: { id }, data });
  }

  async deleteMenuItem(id: number) {
    return this.prisma.restaurantMenuItem.delete({ where: { id } });
  }

  // ==================== EVENT PACKAGES ====================

  async getEventPackages() {
    return this.prisma.eventPackage.findMany({
      include: { hall: true, items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createEventPackage(data: {
    name: string;
    description?: string;
    price: number;
    hallId?: number;
    imageUrl?: string;
    maxGuests?: number;
  }) {
    return this.prisma.eventPackage.create({ data });
  }

  async updateEventPackage(id: number, data: any) {
    return this.prisma.eventPackage.update({ where: { id }, data });
  }

  async deleteEventPackage(id: number) {
    return this.prisma.eventPackage.delete({ where: { id } });
  }

  // ==================== RESTAURANT CATEGORIES ====================

  async getRestaurantCategories() {
    return this.prisma.restaurantCategory.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  async createRestaurantCategory(data: { name: string; sortOrder?: number }) {
    return this.prisma.restaurantCategory.create({ data });
  }

  async deleteRestaurantCategory(id: number) {
    return this.prisma.restaurantCategory.delete({ where: { id } });
  }

  // ==================== RESTAURANT ORDERS ====================

  async getRestaurantOrders() {
    return this.prisma.restaurantOrder.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateRestaurantOrderStatus(id: number, status: string) {
    return this.prisma.restaurantOrder.update({
      where: { id },
      data: { status: status as any },
    });
  }

  async deleteRestaurantOrder(id: number) {
    return this.prisma.restaurantOrder.delete({ where: { id } });
  }

  // ==================== NOTIFICATIONS ====================

  async getNotifications() {
    const [
      contactSubmissions,
      pendingOrders,
      pendingReservations,
      housekeepingTasks,
      maintenanceTickets,
      preparingOrders,
      checkedInReservations,
      checkedOutReservations,
      newEventBookings,
    ] = await Promise.all([
      this.prisma.contactSubmission.findMany({ where: { read: false }, orderBy: { createdAt: 'desc' }, take: 10 }),
      this.prisma.restaurantOrder.findMany({ where: { status: 'PENDING' }, orderBy: { createdAt: 'desc' }, take: 10 }),
      this.prisma.reservation.findMany({
        where: { status: 'PENDING' },
        include: { guest: { select: { firstName: true, lastName: true } }, room: { select: { roomNumber: true } } },
        orderBy: { createdAt: 'desc' }, take: 10,
      }),
      this.prisma.housekeepingTask.findMany({
        where: { status: { not: 'COMPLETED' } },
        include: { room: { select: { roomNumber: true } } },
        orderBy: { createdAt: 'desc' }, take: 10,
      }),
      this.prisma.maintenanceTicket.findMany({
        where: { status: 'NEW' },
        include: { room: { select: { roomNumber: true } } },
        orderBy: { createdAt: 'desc' }, take: 10,
      }),
      this.prisma.restaurantOrder.findMany({
        where: { status: { in: ['ACCEPTED', 'PREPARING'] } },
        orderBy: { updatedAt: 'desc' }, take: 10,
      }),
      this.prisma.reservation.findMany({
        where: { status: 'CHECKED_IN' },
        include: { guest: { select: { firstName: true, lastName: true } }, room: { select: { roomNumber: true } } },
        orderBy: { updatedAt: 'desc' }, take: 10,
      }),
      this.prisma.reservation.findMany({
        where: { status: 'CHECKED_OUT' },
        include: { guest: { select: { firstName: true, lastName: true } }, room: { select: { roomNumber: true } } },
        orderBy: { updatedAt: 'desc' }, take: 10,
      }),
      this.prisma.eventBooking.findMany({
        where: { status: 'PLANNED' },
        orderBy: { createdAt: 'desc' }, take: 10,
      }),
    ]);

    const notifications: { id: string; type: string; title: string; description: string; createdAt: string; read: boolean }[] = [];

    contactSubmissions.forEach((s) => {
      notifications.push({ id: `contact-${s.id}`, type: 'message', title: `Message from ${s.name}`, description: s.subject || s.message?.substring(0, 80) || '', createdAt: s.createdAt.toISOString(), read: false });
    });

    pendingOrders.forEach((o) => {
      notifications.push({ id: `order-${o.id}`, type: 'order', title: `New reservation: ${o.orderNumber}`, description: `From ${o.customerName || 'Guest'}`, createdAt: o.createdAt.toISOString(), read: false });
    });

    pendingReservations.forEach((r) => {
      notifications.push({ id: `reservation-${r.id}`, type: 'reservation', title: `Room booked: ${r.reservationNumber}`, description: `By ${r.guest.firstName} ${r.guest.lastName} — Room ${r.room.roomNumber}`, createdAt: r.createdAt.toISOString(), read: false });
    });

    housekeepingTasks.forEach((t) => {
      notifications.push({ id: `hk-${t.id}`, type: 'housekeeping', title: `Clean room ${t.room?.roomNumber || '—'}`, description: `Priority: ${t.priority}`, createdAt: t.createdAt.toISOString(), read: false });
    });

    maintenanceTickets.forEach((t) => {
      notifications.push({ id: `maint-${t.id}`, type: 'maintenance', title: `Maintenance: ${t.title}`, description: t.description?.substring(0, 80) || (t.room ? `Room ${t.room.roomNumber}` : ''), createdAt: t.createdAt.toISOString(), read: false });
    });

    preparingOrders.forEach((o) => {
      notifications.push({ id: `prep-${o.id}`, type: 'kitchen', title: `Prepare order: ${o.orderNumber}`, description: `${o.status === 'ACCEPTED' ? 'Accepted' : 'Being prepared'} — ${o.customerName || 'Guest'}`, createdAt: o.updatedAt.toISOString(), read: false });
    });

    checkedInReservations.forEach((r) => {
      notifications.push({ id: `checkin-${r.id}`, type: 'check_in', title: `Check-in: ${r.reservationNumber}`, description: `${r.guest.firstName} ${r.guest.lastName} — Room ${r.room.roomNumber}`, createdAt: r.updatedAt.toISOString(), read: false });
    });

    checkedOutReservations.forEach((r) => {
      notifications.push({ id: `checkout-${r.id}`, type: 'check_out', title: `Check-out: ${r.reservationNumber}`, description: `${r.guest.firstName} ${r.guest.lastName} — Room ${r.room.roomNumber}`, createdAt: r.updatedAt.toISOString(), read: false });
    });

    newEventBookings.forEach((b) => {
      notifications.push({ id: `event-${b.id}`, type: 'event_booking', title: `New event booking: ${b.eventName}`, description: `By ${b.contactName} — ${b.guestCount} guests`, createdAt: b.createdAt.toISOString(), read: false });
    });

    notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return { notifications, unread: notifications.length };
  }
}
