import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class ReservationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: {
    page?: number; limit?: number; status?: string;
    guestId?: number; roomId?: number; startDate?: string; endDate?: string;
  }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const { status, guestId, roomId, startDate, endDate } = query;
    const where: any = {};
    if (status) where.status = status;
    if (guestId) where.guestId = Number(guestId);
    if (roomId) where.roomId = Number(roomId);
    if (startDate) where.checkIn = { gte: new Date(startDate) };
    if (endDate) where.checkOut = { lte: new Date(endDate) };

    const [data, total] = await Promise.all([
      this.prisma.reservation.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { guest: true, room: { include: { roomType: true } }, payments: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.reservation.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: {
        guest: true,
        room: { include: { roomType: true } },
        payments: true,
        requests: true,
        notes: true,
      },
    });
    if (!reservation) throw new NotFoundException('Reservation not found');
    return reservation;
  }

  async create(data: any) {
    const count = await this.prisma.reservation.count();
    const number = `HH-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;

    const room = await this.prisma.room.findUnique({ where: { id: data.roomId } });
    if (!room) throw new NotFoundException('Room not found');
    if (room.status === 'OCCUPIED') throw new BadRequestException('Room is already occupied');

    const nights = Math.ceil(
      (new Date(data.checkOut).getTime() - new Date(data.checkIn).getTime()) / (1000 * 60 * 60 * 24),
    );
    const totalAmount = nights * room.price;

    const reservation = await this.prisma.reservation.create({
      data: {
        reservationNumber: number,
        guestId: data.guestId,
        roomId: data.roomId,
        checkIn: new Date(data.checkIn),
        checkOut: new Date(data.checkOut),
        adults: data.adults || 1,
        children: data.children || 0,
        totalAmount,
        source: data.source || 'WALK_IN',
        status: 'CONFIRMED',
        createdById: data.createdById,
      },
    });

    await this.prisma.room.update({
      where: { id: data.roomId },
      data: { status: 'BOOKED' },
    });

    return reservation;
  }

  async update(id: number, data: any) {
    await this.findOne(id);
    return this.prisma.reservation.update({ where: { id }, data });
  }

  async cancel(id: number, reason?: string) {
    const reservation = await this.findOne(id);
    await this.prisma.reservation.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
    await this.prisma.room.update({
      where: { id: reservation.roomId },
      data: { status: 'AVAILABLE' },
    });
    if (reason) {
      await this.prisma.reservationCancellation.create({
        data: { reservationId: id, reason },
      });
    }
    return { message: 'Reservation cancelled' };
  }

  async checkIn(id: number) {
    const reservation = await this.findOne(id);
    if (reservation.status !== 'CONFIRMED') throw new BadRequestException('Reservation must be confirmed');

    await this.prisma.reservation.update({ where: { id }, data: { status: 'CHECKED_IN' } });
    await this.prisma.room.update({
      where: { id: reservation.roomId },
      data: { status: 'OCCUPIED' },
    });
    return { message: 'Guest checked in successfully' };
  }

  async checkOut(id: number) {
    const reservation = await this.findOne(id);
    if (reservation.status !== 'CHECKED_IN') throw new BadRequestException('Guest must be checked in');

    await this.prisma.reservation.update({ where: { id }, data: { status: 'CHECKED_OUT' } });
    await this.prisma.room.update({
      where: { id: reservation.roomId },
      data: { status: 'CLEANING' },
    });
    return { message: 'Guest checked out successfully' };
  }
}
