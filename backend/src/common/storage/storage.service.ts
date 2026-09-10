import { Injectable } from '@nestjs/common';
import { createReadStream, unlinkSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { writeFile } from 'fs/promises';

@Injectable()
export class StorageService {
  private useS3 = process.env.S3_ENABLED === 'true';
  private uploadDir = process.env.UPLOAD_DIR || './uploads';

  async save(filename: string, buffer: Buffer): Promise<string> {
    if (this.useS3) {
      return this.saveS3(filename, buffer);
    }
    return this.saveLocal(filename, buffer);
  }

  async delete(filename: string): Promise<void> {
    if (this.useS3) {
      return this.deleteS3(filename);
    }
    return this.deleteLocal(filename);
  }

  getUrl(filename: string): string {
    if (this.useS3) {
      const endpoint = process.env.S3_ENDPOINT || `https://${process.env.S3_BUCKET}.s3.${process.env.S3_REGION}.amazonaws.com`;
      return `${endpoint}/${filename}`;
    }
    return `/uploads/${filename}`;
  }

  private async saveLocal(filename: string, buffer: Buffer): Promise<string> {
    const dir = join(process.cwd(), this.uploadDir);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    const filepath = join(dir, filename);
    await writeFile(filepath, buffer);
    return `/uploads/${filename}`;
  }

  private async saveS3(filename: string, buffer: Buffer): Promise<string> {
    const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
    const client = new S3Client({
      region: process.env.S3_REGION || 'us-east-1',
      endpoint: process.env.S3_ENDPOINT || undefined,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY || '',
        secretAccessKey: process.env.S3_SECRET_KEY || '',
      },
    });
    await client.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: filename,
      Body: buffer,
    }));
    return this.getUrl(filename);
  }

  private deleteLocal(filename: string): void {
    const filepath = join(process.cwd(), this.uploadDir, filename);
    if (existsSync(filepath)) unlinkSync(filepath);
  }

  private async deleteS3(filename: string): Promise<void> {
    const { S3Client, DeleteObjectCommand } = await import('@aws-sdk/client-s3');
    const client = new S3Client({
      region: process.env.S3_REGION || 'us-east-1',
      endpoint: process.env.S3_ENDPOINT || undefined,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY || '',
        secretAccessKey: process.env.S3_SECRET_KEY || '',
      },
    });
    await client.send(new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: filename,
    }));
  }
}
