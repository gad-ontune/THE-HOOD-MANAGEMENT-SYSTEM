import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class PublicService {
  constructor(private prisma: PrismaService) {}

  async getHomepage() {
    const content = await this.prisma.homepageContent.findFirst();
    const slides = await this.prisma.heroSlide.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
    });
    const promotions = await this.prisma.promotion.findMany({
      where: { active: true, endDate: { gte: new Date() } },
      orderBy: { createdAt: 'desc' },
      take: 3,
    });
    return { content, slides, promotions };
  }

  async getHeroSlides() {
    return this.prisma.heroSlide.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async getPartners() {
    return this.prisma.partner.findMany({
      orderBy: { sortOrder: 'asc' },
    });
  }

  async getRooms() {
    const types = await this.prisma.roomType.findMany({
      include: {
        roomAmenities: { include: { amenity: true } },
      },
      orderBy: { price: 'asc' },
    });
    const rooms = await this.prisma.room.findMany({
      include: { images: { where: { isPrimary: true }, take: 1 } },
    });
    return types.map((type) => {
      const availableRooms = rooms.filter(
        (r) => r.roomTypeId === type.id && r.status === 'AVAILABLE',
      );
      return {
        id: type.id,
        name: type.name,
        description: type.description,
        capacity: type.capacity,
        price: type.price,
        amenities: type.roomAmenities.map((ra) => ra.amenity.name),
        availableRooms: availableRooms.length,
        image: type.imageUrl || rooms.find((r) => r.roomTypeId === type.id)?.images?.[0]?.imageUrl || null,
      };
    });
  }

  async getRoom(id: number) {
    const type = await this.prisma.roomType.findUnique({
      where: { id },
      include: {
        roomAmenities: { include: { amenity: true } },
      },
    });
    if (!type) return null;
    const roomList = await this.prisma.room.findMany({
      where: { roomTypeId: id },
      include: { images: true },
      orderBy: { roomNumber: 'asc' },
    });
    return {
      id: type.id,
      name: type.name,
      description: type.description,
      capacity: type.capacity,
      price: type.price,
      amenities: type.roomAmenities.map((ra) => ra.amenity.name),
      rooms: roomList.map((r) => ({
        number: r.roomNumber,
        floor: r.floor,
        status: r.status,
        images: r.images.map((i) => i.imageUrl),
      })),
    };
  }

  async getMenu() {
    const categories = await this.prisma.restaurantCategory.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        menuItems: {
          where: { available: true },
          orderBy: { name: 'asc' },
        },
      },
    });
    return categories.map((cat) => ({
      category: cat.name,
      items: cat.menuItems.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.imageUrl,
      })),
    }));
  }

  async getEventPackages() {
    return this.prisma.eventPackage.findMany({
      include: {
        items: true,
        hall: true,
      },
    });
  }

  async getGallery() {
    const images = await this.prisma.galleryImage.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    const categories = [...new Set(images.map((i) => i.category).filter(Boolean))];
    return { images, categories };
  }

  async getTestimonials() {
    return this.prisma.guestReview.findMany({
      where: { status: 'APPROVED' },
      include: { guest: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
      take: 6,
    });
  }

  async getFaqs() {
    return this.prisma.faq.findMany({
      orderBy: { sortOrder: 'asc' },
    });
  }

  async getContact() {
    const info = await this.prisma.contactInformation.findMany();
    const hotel = await this.prisma.hotelSetting.findFirst();
    return { info, hotel };
  }

  async getPromotions() {
    return this.prisma.promotion.findMany({
      where: { active: true, endDate: { gte: new Date() } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async submitContact(body: { name: string; phone?: string; email?: string; subject?: string; message: string }) {
    return this.prisma.contactSubmission.create({ data: body });
  }

  async reserveTable(body: { name: string; phone: string; email?: string; date: string; time: string; guests: number; notes?: string }) {
    const count = await this.prisma.restaurantOrder.count();
    const orderNumber = `TBL-${String(count + 1).padStart(4, '0')}`;
    const deposit = 500;
    const order = await this.prisma.restaurantOrder.create({
      data: {
        orderNumber,
        customerName: body.name,
        notes: `Table for ${body.guests} on ${body.date} at ${body.time}${body.notes ? '. ' + body.notes : ''}`,
        status: 'PENDING',
        totalAmount: deposit,
      },
    });
    await this.prisma.restaurantPayment.create({
      data: { orderId: order.id, method: 'MPESA', amount: deposit, status: 'PENDING' },
    });
    const paymentSetting = await this.prisma.paymentSetting.findFirst({ where: { method: 'MPESA', enabled: true } });
    return { order, deposit, mpesa: paymentSetting?.mpesaShortcode || '247247' };
  }

  async bookRoom(body: { firstName: string; lastName: string; phone: string; email?: string; nationality?: string; roomTypeId: number; checkIn: string; checkOut: string; adults?: number; children?: number; specialRequests?: string }) {
    const availableRooms = await this.prisma.room.findMany({
      where: { roomTypeId: body.roomTypeId, status: 'AVAILABLE' },
      orderBy: { roomNumber: 'asc' },
      take: 1,
    });
    if (availableRooms.length === 0) throw new Error('No rooms available for this room type');

    const room = availableRooms[0];
    const nights = Math.ceil(
      (new Date(body.checkOut).getTime() - new Date(body.checkIn).getTime()) / (1000 * 60 * 60 * 24),
    );
    const totalAmount = nights * room.price;

    let guest = await this.prisma.guest.findFirst({ where: { phone: body.phone } });
    if (!guest) {
      const count = await this.prisma.guest.count();
      const guestNumber = `GST-${String(count + 1).padStart(5, '0')}`;
      guest = await this.prisma.guest.create({
        data: {
          guestNumber,
          firstName: body.firstName,
          lastName: body.lastName,
          phone: body.phone,
          email: body.email,
          nationality: body.nationality,
        },
      });
    }

    const count = await this.prisma.reservation.count();
    const reservationNumber = `HH-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;

    const reservation = await this.prisma.reservation.create({
      data: {
        reservationNumber,
        guestId: guest.id,
        roomId: room.id,
        checkIn: new Date(body.checkIn),
        checkOut: new Date(body.checkOut),
        adults: body.adults || 1,
        children: body.children || 0,
        totalAmount,
        status: 'CONFIRMED',
        source: 'WEBSITE',
      },
    });

    await this.prisma.room.update({
      where: { id: room.id },
      data: { status: 'BOOKED' },
    });

    if (body.specialRequests) {
      await this.prisma.reservationRequest.create({
        data: { reservationId: reservation.id, request: body.specialRequests },
      });
    }

    return {
      reservation: {
        number: reservationNumber,
        checkIn: body.checkIn,
        checkOut: body.checkOut,
        guests: body.adults || 1,
        totalAmount,
        status: 'CONFIRMED',
      },
      guest: { name: `${body.firstName} ${body.lastName}`, phone: body.phone },
      room: { number: room.roomNumber, type: room.roomTypeId },
    };
  }

  async bookEvent(body: { packageId: number; contactName: string; contactPhone: string; eventDate: string; guestCount: number; notes?: string }) {
    const pkg = await this.prisma.eventPackage.findUnique({
      where: { id: body.packageId },
      include: { hall: true },
    });
    if (!pkg) throw new Error('Event package not found');

    let hallId = pkg.hallId;
    if (!hallId) {
      const firstHall = await this.prisma.eventHall.findFirst();
      if (firstHall) {
        hallId = firstHall.id;
      } else {
        const newHall = await this.prisma.eventHall.create({
          data: { name: 'Main Hall', capacity: 200, price: 0 },
        });
        hallId = newHall.id;
      }
    }

    const eventDate = new Date(body.eventDate);
    const startTime = new Date(eventDate);
    startTime.setHours(8, 0, 0, 0);
    const endTime = new Date(eventDate);
    endTime.setHours(18, 0, 0, 0);

    const deposit = Math.round(pkg.price * 0.3);

    const booking = await this.prisma.eventBooking.create({
      data: {
        eventName: pkg.name,
        hallId,
        packageId: pkg.id,
        eventDate,
        startTime,
        endTime,
        guestCount: body.guestCount,
        contactName: body.contactName,
        contactPhone: body.contactPhone,
        notes: body.notes,
        deposit,
        totalAmount: pkg.price,
        status: 'PLANNED',
      },
    });

    await this.prisma.eventBookingPayment.create({
      data: { bookingId: booking.id, method: 'MPESA', amount: deposit, status: 'PENDING' },
    });

    const paymentSetting = await this.prisma.paymentSetting.findFirst({ where: { method: 'MPESA', enabled: true } });

    return {
      booking: {
        id: booking.id,
        eventName: booking.eventName,
        eventDate: body.eventDate,
        guestCount: body.guestCount,
        totalAmount: pkg.price,
        deposit,
        status: 'PLANNED',
      },
      contact: { name: body.contactName, phone: body.contactPhone },
      mpesa: {
        method: 'Buy Goods Till',
        number: paymentSetting?.tillNumber || '',
        amount: deposit,
        account: `EVT-${String(booking.id).padStart(4, '0')}`,
      },
    };
  }

  async getPaymentSettings() {
    return this.prisma.paymentSetting.findMany({ where: { enabled: true } });
  }
}
