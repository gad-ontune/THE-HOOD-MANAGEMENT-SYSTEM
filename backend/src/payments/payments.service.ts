import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { page?: number; limit?: number; method?: string; status?: string }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20
    const { method, status } = query;
    const where: any = {};
    if (method) where.method = method;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { guest: true, reservation: true, processedBy: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.payment.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async create(data: any) {
    const count = await this.prisma.payment.count();
    const number = `PAY-${String(count + 1).padStart(6, '0')}`;
    return this.prisma.payment.create({
      data: { ...data, paymentNumber: number },
    });
  }

  async getInvoice(id: number) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: { reservation: { include: { guest: true, room: true } } },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  async refund(id: number, data: { amount: number; reason: string }) {
    const payment = await this.prisma.payment.findUnique({ where: { id } });
    if (!payment) throw new NotFoundException('Payment not found');
    return this.prisma.refund.create({
      data: { paymentId: id, amount: data.amount, reason: data.reason },
    });
  }
}
