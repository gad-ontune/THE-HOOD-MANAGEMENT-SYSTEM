import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { page?: number; limit?: number; categoryId?: number }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20
    const { categoryId } = query;
    const where: any = {};
    if (categoryId) where.categoryId = Number(categoryId);

    const [data, total] = await Promise.all([
      this.prisma.inventoryItem.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { category: true, unit: true, supplier: true },
        orderBy: { name: 'asc' },
      }),
      this.prisma.inventoryItem.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async create(data: any) {
    return this.prisma.inventoryItem.create({ data });
  }

  async update(id: number, data: any) {
    await this.findOne(id);
    return this.prisma.inventoryItem.update({ where: { id }, data });
  }

  async findOne(id: number) {
    const item = await this.prisma.inventoryItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Item not found');
    return item;
  }

  async receiveStock(data: { itemId: number; quantity: number; notes?: string }) {
    const item = await this.findOne(data.itemId);
    const newStock = item.currentStock + data.quantity;
    await this.prisma.inventoryItem.update({
      where: { id: data.itemId },
      data: { currentStock: newStock, totalValue: newStock * item.unitCost },
    });
    return this.prisma.inventoryTransaction.create({
      data: { itemId: data.itemId, type: 'RECEIVE', quantity: data.quantity, notes: data.notes },
    });
  }

  async adjust(data: { itemId: number; quantity: number; reason: string }) {
    const item = await this.findOne(data.itemId);
    const newStock = item.currentStock + data.quantity;
    await this.prisma.inventoryItem.update({
      where: { id: data.itemId },
      data: { currentStock: Math.max(0, newStock), totalValue: Math.max(0, newStock) * item.unitCost },
    });
    return this.prisma.inventoryAdjustment.create({
      data: { itemId: data.itemId, quantity: data.quantity, reason: data.reason },
    });
  }
}
