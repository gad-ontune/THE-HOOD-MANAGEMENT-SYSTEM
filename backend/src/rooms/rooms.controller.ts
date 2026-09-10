import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('rooms')
@UseGuards(JwtAuthGuard)
export class RoomsController {
  constructor(private roomsService: RoomsService) {}

  @Get()
  async findAll(@Query() query: any) {
    return this.roomsService.findAll(query);
  }

  @Get('availability')
  async getAvailability() {
    return this.roomsService.getAvailability();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.roomsService.findOne(+id);
  }

  @Post()
  async create(@Body() body: any) {
    return this.roomsService.create(body);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.roomsService.update(+id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.roomsService.remove(+id);
  }
}
