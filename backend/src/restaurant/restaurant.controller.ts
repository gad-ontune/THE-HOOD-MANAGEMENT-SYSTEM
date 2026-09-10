import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('restaurant')
@UseGuards(JwtAuthGuard)
export class RestaurantController {
  constructor(private restaurantService: RestaurantService) {}

  @Get('menu')
  async getMenu() {
    return this.restaurantService.getMenu();
  }

  @Get('categories')
  async getCategories() {
    return this.restaurantService.getCategories();
  }

  @Post('orders')
  async createOrder(@Body() body: any) {
    return this.restaurantService.createOrder(body);
  }

  @Get('kitchen')
  async getKitchenQueue() {
    return this.restaurantService.getKitchenQueue();
  }

  @Patch('kitchen/:id')
  async updateKitchenStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.restaurantService.updateKitchenStatus(+id, status);
  }
}
