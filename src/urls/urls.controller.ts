import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateUrlDto } from './dto/create-url.dto';
import { UrlsService } from './urls.service';

@Controller('urls')
export class UrlsController {
  constructor(private readonly urlsService: UrlsService) {}

  @Post('process')
  async processUrl(@Body() body: CreateUrlDto) {
    return await this.urlsService.processUrl(body);
  }

  @Get()
  async getUrls() {
    return await this.urlsService.getUrls();
  }
}
