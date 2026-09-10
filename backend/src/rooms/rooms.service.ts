import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { page?: number; limit?: number; status?: string; roomTypeId?: number }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const { status, roomTypeId } = query;
    const where: any = {};
    if (status) where.status = status;
    if (roomTypeId) where.roomTypeId = Number(roomTypeId);

    const [data, total] = await Promise.all([
      this.prisma.room.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { roomType: true, images: { where: { isPrimary: true }, take: 1 } },
        orderBy: { roomNumber: 'asc' },
      }),
      this.prisma.room.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number) {
    const room = await this.prisma.room.findUnique({
      where: { id },
      include: { roomType: { include: { roomAmenities: { include: { amenity: true } } } }, images: true, rates: true },
    });
    if (!room) throw new NotFoundException('Room not found');
    return room;
  }

  async create(data: any) {
    const { images, amenities, ...roomData } = data;
    return this.prisma.room.create({
      data: {
        ...roomData,
        images: images ? { create: images } : undefined,
      },
    });
  }

  async update(id: number, data: any) {
    await this.findOne(id);
    return this.prisma.room.update({ where: { id }, data });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.room.delete({ where: { id } });
  }

  async getAvailability() {
    const rooms = await this.prisma.room.findMany({
      select: { roomNumber: true, status: true, roomType: { select: { name: true } } },
      orderBy: { roomNumber: 'asc' },
    });
    const stats = {
      available: rooms.filter(r => r.status === 'AVAILABLE').length,
      occupied: rooms.filter(r => r.status === 'OCCUPIED').length,
      reserved: rooms.filter(r => r.status === 'RESERVED').length,
      cleaning: rooms.filter(r => r.status === 'CLEANING').length,
      maintenance: rooms.filter(r => r.status === 'MAINTENANCE').length,
      total: rooms.length,
    };
    return { rooms, stats };
  }
}
