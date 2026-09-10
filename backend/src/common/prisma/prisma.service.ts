import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const SOFT_DELETE_MODELS = new Set([
  'User', 'Role', 'Permission', 'Guest', 'GuestPreference', 'GuestDocument',
  'GuestReview', 'GuestContact', 'GuestActivity', 'RoomType', 'Room',
  'RoomImage', 'Amenity', 'RoomStatusHistory', 'RoomRate', 'Reservation',
  'ReservationNote', 'ReservationRequest', 'ReservationCancellation',
  'Payment', 'Invoice', 'InvoiceItem', 'Refund', 'Tax',
  'RestaurantTable', 'RestaurantCategory', 'RestaurantMenuItem',
  'RestaurantOrder', 'RestaurantOrderItem', 'RestaurantPayment',
  'EventHall', 'EventPackage', 'EventPackageItem', 'EventBooking',
  'EventBookingPayment', 'InventoryCategory', 'InventoryUnit',
  'InventoryItem', 'InventoryTransaction', 'InventoryAdjustment',
  'InventoryAlert', 'Supplier', 'PurchaseOrder', 'PurchaseOrderItem',
  'HousekeepingTask', 'HousekeepingChecklist', 'Laundry',
  'MaintenanceCategory', 'MaintenanceTicket', 'Equipment',
  'EquipmentServiceHistory', 'Department', 'Position', 'Employee',
  'EmployeeDocument', 'Attendance', 'LeaveRequest', 'SalaryHistory',
  'EmployeeNote', 'Payroll', 'WebsitePage', 'HomepageContent',
  'GalleryImage', 'Promotion', 'Faq', 'ContactInformation', 'Seo',
  'Partner', 'HeroSlide', 'ContactSubmission', 'UploadedFile',
  'HotelSetting', 'PaymentSetting', 'NotificationSetting', 'SystemSetting',
  'LoginSession', 'PasswordReset',
]);

const FIND_ACTIONS = new Set(['findUnique', 'findFirst', 'findMany', 'count', 'aggregate']);

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    const base = this;
    const ext = this.$extends({
      query: {
        $allModels: {
          async $allOperations({ model, operation, args, query }: any) {
            if (
              model &&
              SOFT_DELETE_MODELS.has(model as string) &&
              FIND_ACTIONS.has(operation) &&
              operation !== 'aggregate'
            ) {
              const newArgs = { ...args };
              if (!newArgs.where) newArgs.where = {};
              if (newArgs.where.deletedAt === undefined) {
                newArgs.where.deletedAt = null;
              }
              return query(newArgs);
            }
            if (model && SOFT_DELETE_MODELS.has(model as string) && operation === 'delete') {
              const delegate = model.charAt(0).toLowerCase() + model.slice(1);
              return (base as any)[delegate].update({
                where: args.where,
                data: { deletedAt: new Date() },
                ...(args.select ? { select: args.select } : {}),
                ...(args.include ? { include: args.include } : {}),
              });
            }
            if (model && SOFT_DELETE_MODELS.has(model as string) && operation === 'deleteMany') {
              const delegate = model.charAt(0).toLowerCase() + model.slice(1);
              return (base as any)[delegate].updateMany({
                where: args.where,
                data: { deletedAt: new Date() },
              });
            }
            return query(args);
          },
        },
      },
    });
    Object.assign(this, ext);
    await this.$connect();
  }

  onModuleDestroy() {
    return this.$disconnect();
  }
}
