import { InjectQueue } from '@nestjs/bullmq';
import { Controller, Post } from '@nestjs/common';
import { Queue } from 'bullmq';

@Controller('videos')
export class VideosController {
  constructor(@InjectQueue('docs') private readonly docsQueue: Queue) {} // Injecting the queue

  @Post('process')
  async processVideo() {
    await this.docsQueue.add('prcess docs', {
      fileName: 'best doc',
      fileType: 'mp4',
    });

    return { message: 'Processing video job added to queue' };
  }
}
