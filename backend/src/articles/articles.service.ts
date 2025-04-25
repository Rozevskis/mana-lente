import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from './article.entity';
import { Cron } from '@nestjs/schedule';
import * as Parser from 'rss-parser';
import { CategorizationService } from './categorization.service';

type RssEnclosure = {
  url: string;
  type?: string;
};

type Enclosure = RssEnclosure | RssEnclosure[] | undefined;

const parser = new Parser();

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article) private repo: Repository<Article>,
    private categorizationService: CategorizationService,
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
    const feed = await parser.parseURL('https://www.lsm.lv/rss/');
    for (const item of feed.items) {
      const exists = await this.repo.findOneBy({ link: item.link });
      if (!exists) {
        let imageUrl: string | undefined = undefined;

        const enclosure = item.enclosure as Enclosure;

        if (Array.isArray(enclosure)) {
          const image = enclosure.find((e) => e.type?.startsWith('image/'));
          imageUrl = image?.url;
        } else if (enclosure?.type?.startsWith('image/')) {
          imageUrl = enclosure.url;
        }

        const article = this.repo.create({
          title: item.title,
          link: item.link,
          description: item.contentSnippet || undefined,
          image: imageUrl,
          publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
        });

        await this.repo.save(article);
      }
    }
    console.log('RSS parsed and articles updated');
  }

  @Cron('*/30 * * * *') // every 30 min
  async processUncategorizedArticles() {
    await this.categorizationService.processUncategorizedArticles();
  }
}
