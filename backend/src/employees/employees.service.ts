import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async addDocument(employeeId: number, data: { type: string; fileUrl: string }) {
    return this.prisma.employeeDocument.create({ data: { employeeId, ...data } });
  }

  async findAll(query: { page?: number; limit?: number; departmentId?: number }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20
    const { departmentId } = query;
    const where: any = {};
    if (departmentId) where.departmentId = Number(departmentId);

    const [data, total] = await Promise.all([
      this.prisma.employee.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { department: true, position: true },
        orderBy: { firstName: 'asc' },
      }),
      this.prisma.employee.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getDepartments() {
    return this.prisma.department.findMany({
      include: { _count: { select: { employees: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async create(data: any) {
    const count = await this.prisma.employee.count();
    const employeeNumber = `EMP-${String(count + 1).padStart(5, '0')}`;
    const { department, position, ...rest } = data;
    let departmentId = data.departmentId;
    let positionId = data.positionId;
    if (department && !departmentId) {
      const name = department.charAt(0).toUpperCase() + department.slice(1).toLowerCase();
      const dept = await this.prisma.department.upsert({
        where: { name },
        update: {},
        create: { name, description: name },
      });
      departmentId = dept.id;
    }
    if (!departmentId) {
      const dept = await this.prisma.department.findFirst();
      departmentId = dept?.id || (await this.prisma.department.create({ data: { name: 'General' } })).id;
    }
    if (position && !positionId) {
      const existing = await this.prisma.position.findFirst({ where: { title: position, departmentId } });
      if (existing) {
        positionId = existing.id;
      } else {
        const pos = await this.prisma.position.create({ data: { title: position, departmentId } });
        positionId = pos.id;
      }
    }
    if (!positionId) {
      positionId = departmentId;
    }
    return this.prisma.employee.create({
      data: { ...rest, employeeNumber, departmentId, positionId, hireDate: new Date() },
    });
  }

  async getAttendance(query: { page?: number; limit?: number; employeeId?: number; date?: string }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20
    const { employeeId, date } = query;
    const where: any = {};
    if (employeeId) where.employeeId = Number(employeeId);
    if (date) where.date = new Date(date);

    const [data, total] = await Promise.all([
      this.prisma.attendance.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { employee: { select: { firstName: true, lastName: true } } },
        orderBy: { date: 'desc' },
      }),
      this.prisma.attendance.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async clockIn(employeeId: number) {
    return this.prisma.attendance.create({
      data: { employeeId, date: new Date(), checkIn: new Date(), status: 'PRESENT' },
    });
  }

  async clockOut(employeeId: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const record = await this.prisma.attendance.findFirst({
      where: { employeeId, date: { gte: today } },
    });
    if (!record) throw new NotFoundException('No check-in record found for today');
    return this.prisma.attendance.update({
      where: { id: record.id },
      data: { checkOut: new Date() },
    });
  }

  async requestLeave(data: any) {
    return this.prisma.leaveRequest.create({ data });
  }

  async getPayroll(query: { page?: number; limit?: number; month?: number; year?: number }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20
    const { month, year } = query;
    const where: any = {};
    if (month) where.month = month;
    if (year) where.year = year;

    const [data, total] = await Promise.all([
      this.prisma.payroll.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { employee: { select: { firstName: true, lastName: true, employeeNumber: true } } },
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
      }),
      this.prisma.payroll.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}
