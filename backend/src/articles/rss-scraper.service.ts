import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from './article.entity';
import * as Parser from 'rss-parser';

type RssEnclosure = {
  url: string;
  type?: string;
};

type Enclosure = RssEnclosure | RssEnclosure[] | undefined;

const parser = new Parser();

@Injectable()
export class RssScraperService {
  constructor(
    @InjectRepository(Article)
    private articleRepository: Repository<Article>,
  ) {}

  async scrapeAndSaveArticles(): Promise<void> {
    const feed = await parser.parseURL('https://www.lsm.lv/rss/');

    for (const item of feed.items) {
      const exists = await this.articleRepository.findOneBy({ link: item.link });
      if (!exists) {
        let imageUrl: string | undefined = undefined;

        const enclosure = item.enclosure as Enclosure;

        if (Array.isArray(enclosure)) {
          const image = enclosure.find((e) => e.type?.startsWith('image/'));
          imageUrl = image?.url;
        } else if (enclosure?.type?.startsWith('image/')) {
          imageUrl = enclosure.url;
        }

        const article = this.articleRepository.create({
          title: item.title,
          link: item.link,
          description: item.contentSnippet || undefined,
          image: imageUrl,
          publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
        });

        await this.articleRepository.save(article);
      }
    }
    console.log('RSS parsed and articles updated');
  }
}
