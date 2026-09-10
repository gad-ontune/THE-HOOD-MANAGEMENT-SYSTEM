import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { PublicService } from './public.service';

@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get('homepage')
  getHomepage() {
    return this.publicService.getHomepage();
  }

  @Get('hero-slides')
  getHeroSlides() {
    return this.publicService.getHeroSlides();
  }

  @Get('partners')
  getPartners() {
    return this.publicService.getPartners();
  }

  @Get('rooms')
  getRooms() {
    return this.publicService.getRooms();
  }

  @Get('rooms/:id')
  getRoom(@Param('id') id: string) {
    return this.publicService.getRoom(+id);
  }

  @Get('restaurant/menu')
  getMenu() {
    return this.publicService.getMenu();
  }

  @Get('events/packages')
  getEventPackages() {
    return this.publicService.getEventPackages();
  }

  @Get('gallery')
  getGallery() {
    return this.publicService.getGallery();
  }

  @Get('testimonials')
  getTestimonials() {
    return this.publicService.getTestimonials();
  }

  @Get('faqs')
  getFaqs() {
    return this.publicService.getFaqs();
  }

  @Get('contact')
  getContact() {
    return this.publicService.getContact();
  }

  @Get('promotions')
  getPromotions() {
    return this.publicService.getPromotions();
  }

  @Post('contact/submit')
  submitContact(@Body() body: { name: string; phone?: string; email?: string; subject?: string; message: string }) {
    return this.publicService.submitContact(body);
  }

  @Post('restaurant/reserve')
  reserveTable(@Body() body: { name: string; phone: string; email?: string; date: string; time: string; guests: number; notes?: string }) {
    return this.publicService.reserveTable(body);
  }

  @Post('events/book')
  bookEvent(@Body() body: { packageId: number; contactName: string; contactPhone: string; eventDate: string; guestCount: number; notes?: string }) {
    return this.publicService.bookEvent(body);
  }

  @Post('book')
  bookRoom(@Body() body: { firstName: string; lastName: string; phone: string; email?: string; nationality?: string; roomTypeId: number; checkIn: string; checkOut: string; adults?: number; children?: number; specialRequests?: string }) {
    return this.publicService.bookRoom(body);
  }

  @Get('payment-settings')
  getPaymentSettings() {
    return this.publicService.getPaymentSettings();
  }
}
