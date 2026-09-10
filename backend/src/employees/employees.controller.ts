import { Controller, Get, Post, Body, Param, ParseIntPipe, Query, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { EmployeesService } from './employees.service';
import { UploadService, UPLOADS_DIR } from '../cms/upload.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('employees')
@UseGuards(JwtAuthGuard)
export class EmployeesController {
  constructor(
    private employeesService: EmployeesService,
    private uploadService: UploadService,
  ) {}

  @Get()
  async findAll(@Query() query: any) {
    return this.employeesService.findAll(query);
  }

  @Post()
  async create(@Body() body: any) {
    return this.employeesService.create(body);
  }

  @Get('attendance')
  async getAttendance(@Query() query: any) {
    return this.employeesService.getAttendance(query);
  }

  @Get('departments')
  async getDepartments() {
    return this.employeesService.getDepartments();
  }

  @Post('attendance/check-in')
  async clockIn(@Body('employeeId') employeeId: number) {
    return this.employeesService.clockIn(employeeId);
  }

  @Post('attendance/check-out')
  async clockOut(@Body('employeeId') employeeId: number) {
    return this.employeesService.clockOut(employeeId);
  }

  @Post('leave')
  async requestLeave(@Body() body: any) {
    return this.employeesService.requestLeave(body);
  }

  @Get('payroll')
  async getPayroll(@Query() query: any) {
    return this.employeesService.getPayroll(query);
  }

  @Post(':id/documents')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({ destination: UPLOADS_DIR, filename: (_req, file, cb) => {
      const ext = file.originalname.substring(file.originalname.lastIndexOf('.'));
      cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + ext);
    }}),
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => cb(null, true),
  }))
  async uploadDocument(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: any,
    @Body('type') type: string,
    @CurrentUser() user?: any,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');
    const record = await this.uploadService.saveFileRecord(file, 'employee', id, user?.id);
    await this.employeesService.addDocument(id, { type: type || 'other', fileUrl: record.url });
    return record;
  }
}
