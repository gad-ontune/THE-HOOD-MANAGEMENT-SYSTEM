import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('maintenance')
@UseGuards(JwtAuthGuard)
export class MaintenanceController {
  constructor(private maintenanceService: MaintenanceService) {}

  @Get()
  async findAll(@Query() query: any) {
    return this.maintenanceService.findAll(query);
  }

  @Post()
  async create(@Body() body: any) {
    return this.maintenanceService.create(body);
  }

  @Patch(':id/assign')
  async assign(@Param('id') id: string, @Body('userId') userId: number) {
    return this.maintenanceService.assign(+id, userId);
  }

  @Patch(':id/complete')
  async complete(@Param('id') id: string) {
    return this.maintenanceService.complete(+id);
  }
}
