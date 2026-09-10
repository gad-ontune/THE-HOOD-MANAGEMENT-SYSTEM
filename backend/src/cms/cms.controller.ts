import { Controller, Get, Put, Post, Body, UseGuards, Param, ParseIntPipe, Delete, Query, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { CmsService } from './cms.service';
import { UploadService, UPLOADS_DIR } from './upload.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('cms')
@UseGuards(JwtAuthGuard)
export class CmsController {
  constructor(
    private cmsService: CmsService,
    private uploadService: UploadService,
  ) {}

  // ==================== HOMEPAGE ====================

  @Get('homepage')
  async getHomepage() {
    return this.cmsService.getHomepage();
  }

  @Put('homepage')
  async updateHomepage(@Body() body: any) {
    return this.cmsService.updateHomepage(body);
  }

  // ==================== HERO SLIDES ====================

  @Get('hero-slides')
  async getHeroSlides() {
    return this.cmsService.getHeroSlides();
  }

  @Post('hero-slides')
  async createHeroSlide(@Body() body: any) {
    return this.cmsService.createHeroSlide(body);
  }

  @Put('hero-slides/:id')
  async updateHeroSlide(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.cmsService.updateHeroSlide(id, body);
  }

  @Delete('hero-slides/:id')
  async deleteHeroSlide(@Param('id', ParseIntPipe) id: number) {
    return this.cmsService.deleteHeroSlide(id);
  }

  // ==================== PARTNERS ====================

  @Get('partners')
  async getPartners() {
    return this.cmsService.getPartners();
  }

  @Post('partners')
  async createPartner(@Body() body: any) {
    return this.cmsService.createPartner(body);
  }

  @Put('partners/:id')
  async updatePartner(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.cmsService.updatePartner(id, body);
  }

  @Delete('partners/:id')
  async deletePartner(@Param('id', ParseIntPipe) id: number) {
    return this.cmsService.deletePartner(id);
  }

  // ==================== GALLERY ====================

  @Get('gallery')
  async getGallery() {
    return this.cmsService.getGallery();
  }

  @Post('gallery')
  async uploadImage(@Body() body: any) {
    return this.cmsService.uploadImage(body);
  }

  @Put('gallery/:id')
  async updateGalleryImage(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    return this.cmsService.updateGalleryImage(id, body);
  }

  @Delete('gallery/:id')
  async deleteGalleryImage(@Param('id', ParseIntPipe) id: number) {
    return this.cmsService.deleteGalleryImage(id);
  }

  // ==================== PROMOTIONS ====================

  @Get('promotions')
  async getPromotions() {
    return this.cmsService.getPromotions();
  }

  @Post('promotions')
  async createPromotion(@Body() body: any) {
    return this.cmsService.createPromotion(body);
  }

  @Put('promotions/:id')
  async updatePromotion(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.cmsService.updatePromotion(id, body);
  }

  @Delete('promotions/:id')
  async deletePromotion(@Param('id', ParseIntPipe) id: number) {
    return this.cmsService.deletePromotion(id);
  }

  // ==================== FAQS ====================

  @Get('faqs')
  async getFaqs() {
    return this.cmsService.getFaqs();
  }

  @Post('faqs')
  async createFaq(@Body() body: any) {
    return this.cmsService.createFaq(body);
  }

  @Put('faqs/:id')
  async updateFaq(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.cmsService.updateFaq(id, body);
  }

  @Delete('faqs/:id')
  async deleteFaq(@Param('id', ParseIntPipe) id: number) {
    return this.cmsService.deleteFaq(id);
  }

  // ==================== CONTACT INFORMATION ====================

  @Get('contact')
  async getContactInfo() {
    return this.cmsService.getContactInfo();
  }

  @Put('contact/:id')
  async updateContactInfo(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.cmsService.upsertContactInfo(id, body);
  }

  @Post('contact')
  async createContactInfo(@Body() body: any) {
    return this.cmsService.upsertContactInfo(null, body);
  }

  @Delete('contact/:id')
  async deleteContactInfo(@Param('id', ParseIntPipe) id: number) {
    return this.cmsService.deleteContactInfo(id);
  }

  // ==================== CONTACT SUBMISSIONS ====================

  @Get('contact-submissions')
  async getContactSubmissions(@Query('read') read?: string) {
    return this.cmsService.getContactSubmissions(read === 'true' ? true : read === 'false' ? false : undefined);
  }

  @Put('contact-submissions/:id/read')
  async markSubmissionRead(@Param('id', ParseIntPipe) id: number) {
    return this.cmsService.markSubmissionRead(id);
  }

  @Delete('contact-submissions/:id')
  async deleteSubmission(@Param('id', ParseIntPipe) id: number) {
    return this.cmsService.deleteSubmission(id);
  }

  // ==================== SEO ====================

  @Get('seo')
  async getSeo(@Query('pageSlug') pageSlug?: string) {
    return this.cmsService.getSeo(pageSlug);
  }

  @Put('seo')
  async upsertSeo(@Body() body: any) {
    return this.cmsService.upsertSeo(body);
  }

  // ==================== FILE STORAGE ====================

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: UPLOADS_DIR,
      filename: (_req, file, cb) => {
        const ext = file.originalname.substring(file.originalname.lastIndexOf('.'));
        const name = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, name + ext);
      },
    }),
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      const allowed = [
        'image/jpeg','image/png','image/gif','image/webp','image/svg+xml',
        'application/pdf','application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain','application/zip','application/x-rar-compressed','application/json',
      ];
      if (!allowed.includes(file.mimetype)) {
        cb(new BadRequestException('File type not allowed: ' + file.mimetype), false);
        return;
      }
      cb(null, true);
    },
  }))
  async uploadFile(
    @UploadedFile() file: any,
    @Body('relatedType') relatedType?: string,
    @Body('relatedId') relatedId?: string,
    @CurrentUser() user?: any,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');
    const saved = await this.uploadService.saveFileRecord(
      file,
      relatedType || undefined,
      relatedId ? Number(relatedId) : undefined,
      user?.id,
    );
    return saved;
  }

  @Get('files')
  async getFiles(@Query() query: any) {
    return this.uploadService.findAll(query);
  }

  @Get('files/:id')
  async getFile(@Param('id', ParseIntPipe) id: number) {
    return this.uploadService.findOne(id);
  }

  @Delete('files/:id')
  async deleteFile(@Param('id', ParseIntPipe) id: number) {
    return this.uploadService.delete(id);
  }

  // ==================== ROOM TYPES (CMS) ====================

  @Get('room-types')
  async getRoomTypes() {
    return this.cmsService.getRoomTypes();
  }

  @Post('room-types')
  async createRoomType(@Body() body: any) {
    return this.cmsService.createRoomType(body);
  }

  @Put('room-types/:id')
  async updateRoomType(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.cmsService.updateRoomType(id, body);
  }

  @Delete('room-types/:id')
  async deleteRoomType(@Param('id', ParseIntPipe) id: number) {
    return this.cmsService.deleteRoomType(id);
  }

  // ==================== MENU ITEMS (CMS) ====================

  @Get('menu-items')
  async getMenuItems() {
    return this.cmsService.getMenuItems();
  }

  @Post('menu-items')
  async createMenuItem(@Body() body: any) {
    return this.cmsService.createMenuItem(body);
  }

  @Put('menu-items/:id')
  async updateMenuItem(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.cmsService.updateMenuItem(id, body);
  }

  @Delete('menu-items/:id')
  async deleteMenuItem(@Param('id', ParseIntPipe) id: number) {
    return this.cmsService.deleteMenuItem(id);
  }

  // ==================== EVENT PACKAGES (CMS) ====================

  @Get('event-packages')
  async getEventPackages() {
    return this.cmsService.getEventPackages();
  }

  @Post('event-packages')
  async createEventPackage(@Body() body: any) {
    return this.cmsService.createEventPackage(body);
  }

  @Put('event-packages/:id')
  async updateEventPackage(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.cmsService.updateEventPackage(id, body);
  }

  @Delete('event-packages/:id')
  async deleteEventPackage(@Param('id', ParseIntPipe) id: number) {
    return this.cmsService.deleteEventPackage(id);
  }

  // ==================== RESTAURANT ORDERS (CMS) ====================

  @Get('restaurant-orders')
  async getRestaurantOrders() {
    return this.cmsService.getRestaurantOrders();
  }

  @Put('restaurant-orders/:id/status')
  async updateRestaurantOrderStatus(@Param('id', ParseIntPipe) id: number, @Body() body: { status: string }) {
    return this.cmsService.updateRestaurantOrderStatus(id, body.status);
  }

  @Delete('restaurant-orders/:id')
  async deleteRestaurantOrder(@Param('id', ParseIntPipe) id: number) {
    return this.cmsService.deleteRestaurantOrder(id);
  }

  // ==================== NOTIFICATIONS (CMS) ====================

  @Get('notifications')
  async getNotifications() {
    return this.cmsService.getNotifications();
  }

  // ==================== RESTAURANT CATEGORIES (CMS) ====================

  @Get('restaurant-categories')
  async getRestaurantCategories() {
    return this.cmsService.getRestaurantCategories();
  }

  @Post('restaurant-categories')
  async createRestaurantCategory(@Body() body: any) {
    return this.cmsService.createRestaurantCategory(body);
  }

  @Delete('restaurant-categories/:id')
  async deleteRestaurantCategory(@Param('id', ParseIntPipe) id: number) {
    return this.cmsService.deleteRestaurantCategory(id);
  }
}
