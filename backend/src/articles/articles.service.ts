import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from './article.entity';
import { Cron } from '@nestjs/schedule';
import * as Parser from 'rss-parser';
const parser = new Parser();

@Injectable()
export class ArticlesService {
  constructor(@InjectRepository(Article) private repo: Repository<Article>) {}

  create(data: Partial<Article>) {
    const article = this.repo.create(data);
    return this.repo.save(article);
  }

  findAll() {
    return this.repo.find();
  }

  @Cron('*/30 * * * *') // every 30 min
  async handleCron() {
    const feed = await parser.parseURL('https://www.lsm.lv/rss/');
    for (const item of feed.items) {
      const exists = await this.repo.findOneBy({ link: item.link });
      if (!exists) {
        await this.repo.save({
          title: item.title,
          link: item.link,
          description: item.contentSnippet,
          publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
        });
      }
    }
    console.log('RSS parsed and articles updated');
  }
}
