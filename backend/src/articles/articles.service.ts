import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from './article.entity';
import { Cron } from '@nestjs/schedule';
import { CategorizationService } from './categorization.service';
import { RssScraperService } from './rss-scraper.service';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';

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

  findAll(query: PaginateQuery): Promise<Paginated<Article>> {
    return paginate(query, this.repo, {
      sortableColumns: ['id', 'title', 'publishedAt'],
      searchableColumns: ['title', 'description'],
      defaultSortBy: [['publishedAt', 'DESC']],
      filterableColumns: {
        categories: true,
      },
      select: ['id', 'title', 'description', 'link', 'image', 'publishedAt', 'categories'],
      maxLimit: 50,
      defaultLimit: 20,
    });
  }

  @Cron('*/30 * * * *') // every 30 min
  async handleCron() {
    await this.rssScraperService.scrapeAndSaveArticles();
    await this.categorizationService.processUncategorizedArticles();
  }
}
