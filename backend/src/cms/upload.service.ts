import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { extname, join } from 'path';
import { existsSync, unlinkSync } from 'fs';
import { PrismaService } from '../common/prisma/prisma.service';
import { StorageService } from '../common/storage/storage.service';

export const UPLOADS_DIR = join(process.cwd(), process.env.UPLOAD_DIR || 'uploads');

const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'application/zip',
  'application/x-rar-compressed',
  'application/json',
];

const MAX_SIZE = 50 * 1024 * 1024;

@Injectable()
export class UploadService {
  constructor(private prisma: PrismaService, private storage: StorageService) {}

  get storageConfig() {
    return {
      destination: UPLOADS_DIR,
      filename: (_req: any, file: any, cb: (err: Error | null, name: string) => void) => {
        const name = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, name + extname(file.originalname));
      },
    };
  }

  get limits() {
    return { fileSize: MAX_SIZE };
  }

  fileFilter(_req: any, file: any, cb: (err: Error | null, accept: boolean) => void) {
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      cb(new BadRequestException(`File type ${file.mimetype} not allowed`), false);
      return;
    }
    cb(null, true);
  }

  async saveFileRecord(file: any, relatedType?: string, relatedId?: number, uploadedById?: number) {
    const url = this.storage.getUrl(file.filename);
    return this.prisma.uploadedFile.create({
      data: {
        originalName: file.originalname,
        storedName: file.filename,
        mimeType: file.mimetype,
        size: file.size,
        url,
        relatedType: relatedType || null,
        relatedId: relatedId || null,
        uploadedById: uploadedById || null,
      },
    });
  }

  async findAll(query: { page?: number; limit?: number; mimeType?: string; relatedType?: string }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 50;
    const where: any = {};
    if (query.mimeType) where.mimeType = { startsWith: query.mimeType };
    if (query.relatedType) where.relatedType = query.relatedType;

    const [data, total] = await Promise.all([
      this.prisma.uploadedFile.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { uploadedBy: { select: { username: true, email: true } } },
      }),
      this.prisma.uploadedFile.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number) {
    const file = await this.prisma.uploadedFile.findUnique({ where: { id } });
    if (!file) throw new NotFoundException('File not found');
    return file;
  }

  async delete(id: number) {
    const file = await this.findOne(id);
    await this.storage.delete(file.storedName);
    return this.prisma.uploadedFile.delete({ where: { id } });
  }

  async deleteByUrl(url: string) {
    const file = await this.prisma.uploadedFile.findFirst({ where: { url } });
    if (file) await this.delete(file.id);
  }
}
