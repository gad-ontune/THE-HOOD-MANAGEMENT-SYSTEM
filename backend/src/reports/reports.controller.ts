import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('revenue')
  async getRevenue(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.reportsService.getRevenue(startDate, endDate);
  }

  @Get('occupancy')
  async getOccupancy(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.reportsService.getOccupancy(startDate, endDate);
  }

  @Get('restaurant')
  async getRestaurant(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.reportsService.getRestaurant(startDate, endDate);
  }

  @Get('inventory')
  async getInventory() {
    return this.reportsService.getInventory();
  }
}
