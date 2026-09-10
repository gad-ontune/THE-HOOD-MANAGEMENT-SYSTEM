import { Module } from '@nestjs/common';
import { CmsController } from './cms.controller';
import { CmsService } from './cms.service';
import { UploadService } from './upload.service';

@Module({
  controllers: [CmsController],
  providers: [CmsService, UploadService],
  exports: [UploadService],
})
export class CmsModule {}
