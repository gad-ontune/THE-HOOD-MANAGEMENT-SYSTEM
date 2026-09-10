import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, Query, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { GuestsService } from './guests.service';
import { UploadService, UPLOADS_DIR } from '../cms/upload.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('guests')
@UseGuards(JwtAuthGuard)
export class GuestsController {
  constructor(
    private guestsService: GuestsService,
    private uploadService: UploadService,
  ) {}

  @Get()
  async findAll(@Query() query: any) {
    return this.guestsService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.guestsService.findOne(+id);
  }

  @Post()
  async create(@Body() body: any) {
    return this.guestsService.create(body);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.guestsService.update(+id, body);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.guestsService.delete(+id);
  }

  @Get(':id/history')
  async getHistory(@Param('id') id: string) {
    return this.guestsService.getHistory(+id);
  }

  @Post(':id/documents')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({ destination: UPLOADS_DIR, filename: (_req, file, cb) => {
      const ext = file.originalname.substring(file.originalname.lastIndexOf('.'));
      cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + ext);
    }}),
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => cb(null, true),
  }))
  async uploadDocument(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: any,
    @Body('type') type: string,
    @CurrentUser() user?: any,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');
    const record = await this.uploadService.saveFileRecord(file, 'guest', id, user?.id);
    await this.guestsService.addDocument(id, { type: type || 'other', fileUrl: record.url });
    return record;
  }
}
