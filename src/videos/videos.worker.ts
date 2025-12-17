import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('docs', { concurrency: 1 })
export class VideoProcessor extends WorkerHost {
  async process(job: Job): Promise<void> {
    console.log('New job : ', job.id);
    return Promise.resolve();
  }
}
