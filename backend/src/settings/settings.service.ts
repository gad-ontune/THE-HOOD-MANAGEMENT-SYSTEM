import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getHotel() {
    return this.prisma.hotelSetting.findFirst();
  }

  async updateHotel(data: any) {
    const existing = await this.prisma.hotelSetting.findFirst();
    if (existing) {
      return this.prisma.hotelSetting.update({ where: { id: existing.id }, data });
    }
    return this.prisma.hotelSetting.create({ data });
  }

  async updatePayment(data: any) {
    const existing = await this.prisma.paymentSetting.findFirst({
      where: { method: data.method },
    });
    if (existing) {
      return this.prisma.paymentSetting.update({ where: { id: existing.id }, data });
    }
    return this.prisma.paymentSetting.create({ data });
  }

  async updateTheme(theme: string) {
    return this.prisma.systemSetting.upsert({
      where: { key: 'theme' },
      update: { value: theme },
      create: { key: 'theme', value: theme },
    });
  }
}
