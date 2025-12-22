import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { UrlsService } from './urls.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Url } from './entities/url.entity';
import { Repository } from 'typeorm';
import { DocsGateWay } from 'src/docs/docs-gateway';
import { Status } from 'src/types/status.enum';
import puppeteer from 'puppeteer';

interface UrlsProcessorJobData {
  urlId: string;
}

@Processor('urls')
export class UrlsProcessor extends WorkerHost {
  private async updateStatusAndEmit(urlId: string, status: Status) {
    const url = await this.urlsService.findUrlById(urlId);

    url.status = status;

    await this.urlsRepo.save(url);

    this.docsGateway.emitJobUpdate(urlId, status);
  }

  constructor(
    private readonly urlsService: UrlsService,
    @InjectRepository(Url) private readonly urlsRepo: Repository<Url>,
    private readonly docsGateway: DocsGateWay,
  ) {
    super();
  }

  async process(job: Job<UrlsProcessorJobData>) {
    console.log('Hello');
    const url = await this.urlsService.findUrlById(job.data.urlId);

    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ],
    });
    try {
      const page = await browser.newPage();

      await page.setViewport({ width: 1920, height: 1000 });

      await page.goto(url.original_link);

      await page.waitForSelector('body');

      const data = await page.evaluate(() => {
        const getText = (element: Element | null) =>
          element ? element.textContent.trim() : null;

        const title = getText(document.querySelector('title'));

        const headings = document.querySelectorAll('h1 , h2 ,h3');

        const pTags = document.querySelectorAll('p');

        const headingText = Array.from(headings)
          .map((h) => getText(h))
          .filter(Boolean);

        const paragraphs = Array.from(pTags)
          .map((p) => getText(p))
          .filter(Boolean);

        return { title, headingText, paragraphs };
      });

      console.log(data);
    } catch (error) {
      console.log(error);
    }

    return Promise.resolve(() => {});
  }

  @OnWorkerEvent('active')
  async onAdd(job: Job<UrlsProcessorJobData>) {
    await this.updateStatusAndEmit(job.data.urlId, Status.PROCESSING);
  }

  @OnWorkerEvent('completed')
  async onCompleted(job: Job<UrlsProcessorJobData>) {
    await this.updateStatusAndEmit(job.data.urlId, Status.COMPLETED);
  }

  @OnWorkerEvent('failed')
  async OnFailed(job: Job<UrlsProcessorJobData>) {
    await this.updateStatusAndEmit(job.data.urlId, Status.FAILED);
  }
}
