import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUrlDto } from './dto/create-url.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Url } from './entities/url.entity';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class UrlsService {
  constructor(
    @InjectRepository(Url) private readonly urlRepo: Repository<Url>,
    @InjectQueue('urls') private readonly urlsQueue: Queue,
  ) {}

  async findUrlById(id: string) {
    const url = await this.urlRepo.findOne({ where: { id } });
    if (!url) throw new NotFoundException(`No url against ${id} found`);

    return url;
  }

  async processUrl(createUrlDto: CreateUrlDto) {
    const url = this.urlRepo.create({
      original_link: createUrlDto.url,
    });

    await this.urlRepo.save(url);

    await this.urlsQueue.add('process-url', {
      urlId: url.id,
    });
  }

  async getUrls() {
    return await this.urlRepo.find();
  }
}
