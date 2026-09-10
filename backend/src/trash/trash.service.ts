import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class TrashService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly modelMap: Record<string, string> = {
    users: 'user', roles: 'role', permissions: 'permission',
    guests: 'guest', roomTypes: 'roomType', rooms: 'room',
    amenities: 'amenity', reservations: 'reservation',
    payments: 'payment', invoices: 'invoice', taxes: 'tax',
    restaurantTables: 'restaurantTable', restaurantCategories: 'restaurantCategory',
    restaurantMenuItems: 'restaurantMenuItem', restaurantOrders: 'restaurantOrder',
    eventHalls: 'eventHall', eventPackages: 'eventPackage',
    eventBookings: 'eventBooking', inventoryCategories: 'inventoryCategory',
    inventoryUnits: 'inventoryUnit', inventoryItems: 'inventoryItem',
    suppliers: 'supplier', purchaseOrders: 'purchaseOrder',
    housekeepingTasks: 'housekeepingTask', laundryItems: 'laundry',
    maintenanceCategories: 'maintenanceCategory', maintenanceTickets: 'maintenanceTicket',
    equipment: 'equipment', departments: 'department', positions: 'position',
    employees: 'employee', attendanceRecords: 'attendance',
    leaveRequests: 'leaveRequest', payrollRecords: 'payroll',
    websitePages: 'websitePage', homepageContent: 'homepageContent',
    galleryImages: 'galleryImage', promotions: 'promotion',
    faqs: 'faq', contactInformation: 'contactInformation',
    seoEntries: 'seo', partners: 'partner', heroSlides: 'heroSlide',
    contactSubmissions: 'contactSubmission', uploadedFiles: 'uploadedFile',
    hotelSettings: 'hotelSetting', paymentSettings: 'paymentSetting',
    notificationSettings: 'notificationSetting', systemSettings: 'systemSetting',
  };

  async findAll(entity: string) {
    const model = this.modelMap[entity];
    if (!model) throw new Error(`Unknown entity: ${entity}`);
    return (this.prisma as any)[model].findMany({
      where: { deletedAt: { not: null } },
    });
  }

  async restore(entity: string, id: number) {
    const model = this.modelMap[entity];
    if (!model) throw new Error(`Unknown entity: ${entity}`);
    return (this.prisma as any)[model].update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  async forceDelete(entity: string, id: number) {
    const model = this.modelMap[entity];
    if (!model) throw new Error(`Unknown entity: ${entity}`);
    return (this.prisma as any)[model].delete({ where: { id } });
  }

  async getTrashSummary() {
    const summaries: Record<string, { label: string; count: number }> = {};
    for (const [entity, model] of Object.entries(this.modelMap)) {
      const count = await (this.prisma as any)[model].count({
        where: { deletedAt: { not: null } },
      });
      if (count > 0) summaries[entity] = { label: entity.replace(/([A-Z])/g, ' $1').trim(), count };
    }
    return summaries;
  }
}
