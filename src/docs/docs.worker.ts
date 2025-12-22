import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'bullmq';
import { Doc } from './entities/docs.entity';
import { Repository } from 'typeorm';
import { Status } from 'src/types/status.enum';
import { DocsGateWay } from './docs-gateway';
import { DocsService } from './docs.service';
import { join } from 'path';
import * as fs from 'fs/promises';
import { PDFParse } from 'pdf-parse';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

interface ProcessDocJobData {
  fileId: string;
}

@Processor('docs', { concurrency: 1, limiter: { duration: 30000, max: 1 } })
export class DocsProcessor extends WorkerHost {
  constructor(
    private readonly docService: DocsService,
    @InjectRepository(Doc) private readonly docRepo: Repository<Doc>,
    private readonly docGateWay: DocsGateWay,
  ) {
    super();
  }

  async process(job: Job<ProcessDocJobData>) {
    try {
      const doc = await this.docService.findDocById(job.data.fileId);

      const filePath = join('public/docs', doc.modified_file_name);
      const dataBuffer = await fs.readFile(filePath);
      const parser = new PDFParse({ data: dataBuffer });
      const data = await parser.getText();

      console.log(data); // TODO: Normalize this data to store in db
      return data;
    } catch (error) {
      const fsError = error as NodeJS.ErrnoException;
      if (fsError.code === 'ENOENT')
        throw new NotFoundException("File doesn't exist");
      else throw new InternalServerErrorException('Something went wrong');
    }
  }

  @OnWorkerEvent('active')
  async onActive(job: Job<ProcessDocJobData>) {
    const doc = await this.docService.findDocById(job.data.fileId);

    doc.status = Status.PROCESSING;

    await this.docRepo.save(doc);

    this.docGateWay.emitJobUpdate(doc.id, doc.status);
  }

  @OnWorkerEvent('completed')
  async onCompleted(job: Job<ProcessDocJobData>) {
    const doc = await this.docService.findDocById(job.data.fileId);

    doc.status = Status.COMPLETED;

    await this.docRepo.save(doc);

    this.docGateWay.emitJobUpdate(doc.id, doc.status);
  }

  @OnWorkerEvent('failed')
  async onFailed(job: Job<ProcessDocJobData>) {
    const doc = await this.docService.findDocById(job.data.fileId);

    doc.status = Status.FAILED;

    await this.docRepo.save(doc);

    this.docGateWay.emitJobUpdate(doc.id, doc.status);
  }
}
