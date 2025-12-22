import { InjectQueue } from '@nestjs/bullmq';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bullmq';
import { Doc } from './entities/docs.entity';
import { Repository } from 'typeorm';
import path, { extname } from 'path';
import * as fs from 'node:fs/promises';

@Injectable()
export class DocsService {
  constructor(
    @InjectQueue('docs') private readonly docsQueue: Queue,
    @InjectRepository(Doc) private readonly docRepo: Repository<Doc>,
  ) {}

  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024;

  private readonly ALLOWED_FILE_TYPES = ['application/pdf'];

  async findDocById(id: string): Promise<Doc> {
    const doc = await this.docRepo.findOne({ where: { id } });

    if (!doc) throw new NotFoundException(`File with ${id} not found`);

    return doc;
  }

  async processDoc(file: Express.Multer.File) {
    if (file.size > this.MAX_FILE_SIZE) {
      throw new BadRequestException("File size shouldn't exceed 10MB");
    }

    if (!this.ALLOWED_FILE_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('File is not supported');
    }

    const extension = extname(file.originalname);
    const fileName = file.originalname.replace(extension, '');
    const modifiedFileName = `${fileName}-${Date.now()}${extension}`;

    const savePath = path.join('public/docs', modifiedFileName);

    try {
      await fs.writeFile(savePath, file.buffer);
    } catch (error: unknown) {
      const fsError = error as NodeJS.ErrnoException;
      console.log(error);
      if (fsError.code === 'ENOENT') {
        await fs.mkdir(path.dirname(savePath), { recursive: true });
        await fs.writeFile(savePath, file.buffer);
      } else {
        throw new InternalServerErrorException('Failed to save file');
      }
    }

    const doc = this.docRepo.create({
      original_file_name: fileName,
      modified_file_name: modifiedFileName,
    });

    await this.docRepo.save(doc);

    await this.docsQueue.add('process-doc', { fileId: doc.id });

    return {
      message: 'File has been uploaded',
      doc,
    };
  }

  async getDocs(): Promise<Doc[]> {
    return await this.docRepo.find();
  }
}
