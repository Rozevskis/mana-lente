import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from './article.entity';
import { Cron } from '@nestjs/schedule';
import { CategorizationService } from './categorization.service';
import { RssScraperService } from './rss-scraper.service';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { sortArticlesByScore } from './article-sorting.util';

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
      select: ['id', 'title', 'description', 'link', 'image', 'categories', 'publishedAt'],
      maxLimit: 50,
      defaultLimit: 20,
    });
  }

  async findAllWithSorting(
    query: PaginateQuery,
    biases: Record<string, number> | null,
    user: any | null,
    isDebugMode: boolean = false
  ) {
    const paginatedResult = await this.findAll(query);
    const { data: articles } = paginatedResult;
    
    let userBiases = biases;
    
    if (user && user.categoryBiases) {
      userBiases = user.categoryBiases;
    }
    
    // if no biases are available but we're in debug mode, use default biases
    if (!userBiases && isDebugMode) {
      const defaultBiases: Record<string, number> = {};
      // Create default biases (0.5) for all categories found in articles
      articles.forEach(article => {
        if (article.categories && article.categories.length > 0) {
          article.categories.forEach(category => {
            if (!defaultBiases[category]) {
              defaultBiases[category] = 0.5; // Default middle value
            }
          });
        }
      });
      userBiases = defaultBiases;
    }
    
    // If no biases are available (and not in debug mode), return unsorted articles
    if (!userBiases) {
      return paginatedResult;
    }
    
    // Sort articles based on user biases - at this point userBiases is guaranteed to be non-null
    const sortedArticles = sortArticlesByScore(articles, userBiases as Record<string, number>);
    
    // Return the sorted articles in the same paginated format
    return {
      ...paginatedResult,
      data: sortedArticles
    };
  }

  @Cron('*/30 * * * *') // every 30 min
  async handleCron() {
    // await this.rssScraperService.scrapeAndSaveArticles();
    // await this.categorizationService.processUncategorizedArticles();
  }
}
