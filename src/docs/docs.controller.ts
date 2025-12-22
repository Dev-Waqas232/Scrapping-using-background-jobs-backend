import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import multer from 'multer';
import { DocsService } from './docs.service';

@Controller('docs')
export class DocsController {
  constructor(private readonly docsService: DocsService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.memoryStorage(),
    }),
  )
  processDoc(@UploadedFile() file: Express.Multer.File) {
    return this.docsService.processDoc(file);
  }

  @Get()
  getDocs() {
    return this.docsService.getDocs();
  }
}
