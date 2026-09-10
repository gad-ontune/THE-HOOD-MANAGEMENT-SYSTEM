import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { HousekeepingService } from './housekeeping.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('housekeeping')
@UseGuards(JwtAuthGuard)
export class HousekeepingController {
  constructor(private housekeepingService: HousekeepingService) {}

  @Get('tasks')
  async getTasks(@Query() query: any) {
    return this.housekeepingService.getTasks(query);
  }

  @Post('tasks')
  async assignTask(@Body() body: any) {
    return this.housekeepingService.assignTask(body);
  }

  @Patch('tasks/:id')
  async completeTask(@Param('id') id: string) {
    return this.housekeepingService.completeTask(+id);
  }

  @Get('laundry')
  async getLaundry() {
    return this.housekeepingService.getLaundry();
  }
}
