import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class MaintenanceService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { page?: number; limit?: number; status?: string }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20
    const { status } = query;
    const where: any = {};
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.maintenanceTicket.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { room: true, category: true, assignedToUser: { select: { username: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.maintenanceTicket.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async create(data: any) {
    return this.prisma.maintenanceTicket.create({ data });
  }

  async assign(ticketId: number, userId: number) {
    return this.prisma.maintenanceTicket.update({
      where: { id: ticketId },
      data: { assignedTo: userId, status: 'ASSIGNED' },
    });
  }

  async complete(ticketId: number) {
    return this.prisma.maintenanceTicket.update({
      where: { id: ticketId },
      data: { status: 'COMPLETED' },
    });
  }
}
