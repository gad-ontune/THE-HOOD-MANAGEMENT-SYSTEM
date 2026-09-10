import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class GuestsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { page?: number; limit?: number; search?: string }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const { search } = query;
    const where = search
      ? {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' as const } },
            { lastName: { contains: search, mode: 'insensitive' as const } },
            { phone: { contains: search } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};
    const [data, total] = await Promise.all([
      this.prisma.guest.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.guest.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number) {
    const guest = await this.prisma.guest.findUnique({
      where: { id },
      include: {
        preferences: true,
        reservations: { include: { room: true }, take: 10, orderBy: { createdAt: 'desc' } },
        reviews: true,
      },
    });
    if (!guest) throw new NotFoundException('Guest not found');
    return guest;
  }

  async create(data: any) {
    const count = await this.prisma.guest.count();
    const guestNumber = `GST-${String(count + 1).padStart(5, '0')}`;
    return this.prisma.guest.create({ data: { ...data, guestNumber } });
  }

  async update(id: number, data: any) {
    await this.findOne(id);
    return this.prisma.guest.update({ where: { id }, data });
  }

  async delete(id: number) {
    await this.findOne(id);
    return this.prisma.guest.delete({ where: { id } });
  }

  async getHistory(id: number) {
    const guest = await this.prisma.guest.findUnique({
      where: { id },
      include: {
        reservations: { include: { room: true, payments: true }, orderBy: { createdAt: 'desc' } },
        reviews: true,
      },
    });
    if (!guest) throw new NotFoundException('Guest not found');
    return guest;
  }

  async addDocument(guestId: number, data: { type: string; fileUrl: string }) {
    return this.prisma.guestDocument.create({ data: { guestId, ...data } });
  }
}
