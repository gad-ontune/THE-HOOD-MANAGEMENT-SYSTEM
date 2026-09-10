import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class HousekeepingService {
  constructor(private prisma: PrismaService) {}

  async getTasks(query: { page?: number; limit?: number; status?: string }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20
    const { status } = query;
    const where: any = {};
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.housekeepingTask.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { room: true, assignedEmployee: { select: { id: true, firstName: true, lastName: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.housekeepingTask.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async assignTask(data: { roomId: number; assignedTo?: number; priority?: string; notes?: string }) {
    return this.prisma.housekeepingTask.create({
      data: {
        roomId: data.roomId,
        assignedTo: data.assignedTo,
        priority: data.priority || 'NORMAL',
        notes: data.notes,
      },
    });
  }

  async completeTask(id: number) {
    return this.prisma.housekeepingTask.update({
      where: { id },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });
  }

  async getLaundry() {
    return this.prisma.laundry.findMany({
      include: { room: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
