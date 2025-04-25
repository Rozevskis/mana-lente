import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from './article.entity';
import { Cron } from '@nestjs/schedule';
import { CategorizationService } from './categorization.service';
import { RssScraperService } from './rss-scraper.service';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article) private repo: Repository<Article>,
    private categorizationService: CategorizationService,
    private rssScraperService: RssScraperService,
  ) {}

  create(data: Partial<Article>) {
    const article = this.repo.create(data);
    return this.repo.save(article);
  }

  findAll() {
    return this.repo.find({
      order: {
        publishedAt: 'DESC',
      },
    });
  }

  @Cron('*/30 * * * *') // every 30 min
  async handleCron() {
    await this.rssScraperService.scrapeAndSaveArticles();
    await this.categorizationService.processUncategorizedArticles();
  }
}
