import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getRevenue(startDate?: string, endDate?: string) {
    const where: any = { status: 'COMPLETED' };
    if (startDate) where.createdAt = { gte: new Date(startDate) };
    if (endDate) where.createdAt = { ...where.createdAt, lte: new Date(endDate) };

    const payments = await this.prisma.payment.findMany({ where });
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const byMethod = payments.reduce((acc: any, p) => {
      acc[p.method] = (acc[p.method] || 0) + p.amount;
      return acc;
    }, {});

    return { totalRevenue, totalTransactions: payments.length, byMethod };
  }

  async getOccupancy(startDate?: string, endDate?: string) {
    const totalRooms = await this.prisma.room.count();
    const where: any = {};
    if (startDate) where.checkIn = { gte: new Date(startDate) };
    if (endDate) where.checkOut = { lte: new Date(endDate) };

    const activeReservations = await this.prisma.reservation.findMany({
      where: { ...where, status: { in: ['CHECKED_IN', 'CONFIRMED'] } },
    });

    const occupied = await this.prisma.room.count({ where: { status: 'OCCUPIED' } });
    return {
      totalRooms,
      occupied,
      available: totalRooms - occupied,
      occupancyRate: Math.round((occupied / totalRooms) * 100),
      activeReservations: activeReservations.length,
    };
  }

  async getRestaurant(startDate?: string, endDate?: string) {
    const where: any = {};
    if (startDate) where.createdAt = { gte: new Date(startDate) };
    if (endDate) where.createdAt = { ...where.createdAt, lte: new Date(endDate) };

    const orders = await this.prisma.restaurantOrder.findMany({
      where: { ...where, status: 'SERVED' },
    });
    const totalSales = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    return { totalSales, totalOrders: orders.length, averageOrder: orders.length ? totalSales / orders.length : 0 };
  }

  async getInventory() {
    const items = await this.prisma.inventoryItem.findMany({
      include: { category: true },
    });
    const totalValue = items.reduce((sum, i) => sum + (i.totalValue || 0), 0);
    const lowStock = items.filter(i => i.currentStock <= i.minimumStock);

    return { totalItems: items.length, totalValue, lowStockCount: lowStock.length, lowStockItems: lowStock };
  }
}
