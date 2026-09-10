import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class RestaurantService {
  constructor(private prisma: PrismaService) {}

  async getMenu() {
    return this.prisma.restaurantMenuItem.findMany({
      where: { available: true },
      include: { category: true },
      orderBy: { categoryId: 'asc' },
    });
  }

  async getCategories() {
    return this.prisma.restaurantCategory.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  async createOrder(data: any) {
    const count = await this.prisma.restaurantOrder.count();
    const orderNumber = `ORD-${String(count + 1).padStart(5, '0')}`;
    const { items, ...orderData } = data;

    return this.prisma.restaurantOrder.create({
      data: {
        ...orderData,
        orderNumber,
        items: {
          create: items.map((item: any) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.quantity * item.unitPrice,
          })),
        },
      },
      include: { items: { include: { menuItem: true } }, table: true },
    });
  }

  async getKitchenQueue() {
    return this.prisma.restaurantOrder.findMany({
      where: { status: { in: ['PENDING', 'ACCEPTED', 'PREPARING'] } },
      include: { items: { include: { menuItem: true } }, table: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async updateKitchenStatus(id: number, status: string) {
    return this.prisma.restaurantOrder.update({ where: { id }, data: { status: status as any } });
  }
}
