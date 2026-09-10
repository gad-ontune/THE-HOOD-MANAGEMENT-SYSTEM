import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 20) {
    const [data, total] = await Promise.all([
      this.prisma.eventBooking.findMany({
        skip: (page - 1) * limit,
        take: limit,
        include: { hall: true, payments: true },
        orderBy: { eventDate: 'desc' },
      }),
      this.prisma.eventBooking.count(),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async book(data: any) {
    return this.prisma.eventBooking.create({ data });
  }

  async getCalendar() {
    return this.prisma.eventBooking.findMany({
      select: { id: true, eventName: true, eventDate: true, status: true },
      orderBy: { eventDate: 'asc' },
    });
  }

  async getPackages() {
    return this.prisma.eventPackage.findMany({
      include: { items: true, hall: true },
    });
  }
}
