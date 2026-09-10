import { Controller, Get, Post, Put, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('reservations')
@UseGuards(JwtAuthGuard)
export class ReservationsController {
  constructor(private reservationsService: ReservationsService) {}

  @Get()
  async findAll(@Query() query: any) {
    return this.reservationsService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.reservationsService.findOne(+id);
  }

  @Post()
  async create(@Body() body: any) {
    return this.reservationsService.create(body);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.reservationsService.update(+id, body);
  }

  @Patch(':id/cancel')
  async cancel(@Param('id') id: string, @Body('reason') reason?: string) {
    return this.reservationsService.cancel(+id, reason);
  }

  @Post(':id/check-in')
  async checkIn(@Param('id') id: string) {
    return this.reservationsService.checkIn(+id);
  }

  @Post(':id/check-out')
  async checkOut(@Param('id') id: string) {
    return this.reservationsService.checkOut(+id);
  }
}
