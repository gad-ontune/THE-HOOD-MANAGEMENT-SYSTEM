import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  @Get()
  async findAll(@Query() query: any) {
    return this.inventoryService.findAll(query);
  }

  @Post()
  async create(@Body() body: any) {
    return this.inventoryService.create(body);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.inventoryService.update(+id, body);
  }

  @Post('receive')
  async receiveStock(@Body() body: any) {
    return this.inventoryService.receiveStock(body);
  }

  @Post('adjust')
  async adjust(@Body() body: any) {
    return this.inventoryService.adjust(body);
  }
}
