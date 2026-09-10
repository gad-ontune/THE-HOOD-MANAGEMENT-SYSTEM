import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('events')
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @Get()
  async findAll(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.eventsService.findAll(+page, +limit);
  }

  @Post()
  async book(@Body() body: any) {
    return this.eventsService.book(body);
  }

  @Get('calendar')
  async getCalendar() {
    return this.eventsService.getCalendar();
  }

  @Get('packages')
  async getPackages() {
    return this.eventsService.getPackages();
  }
}
