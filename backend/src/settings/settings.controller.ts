import { Controller, Get, Put, Patch, Body, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get('hotel')
  async getHotel() {
    return this.settingsService.getHotel();
  }

  @Put('hotel')
  @Roles('Owner', 'Manager')
  async updateHotel(@Body() body: any) {
    return this.settingsService.updateHotel(body);
  }

  @Put('payment')
  @Roles('Owner')
  async updatePayment(@Body() body: any) {
    return this.settingsService.updatePayment(body);
  }

  @Patch('theme')
  async updateTheme(@Body('theme') theme: string) {
    return this.settingsService.updateTheme(theme);
  }
}
