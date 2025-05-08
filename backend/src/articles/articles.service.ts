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

  async findAll(query: PaginateQuery): Promise<Paginated<Article>> {
    if (query.filter && query.filter.categories) {
      try {
        let categoryValue = query.filter.categories;
        if (typeof categoryValue === 'string') {
          try {
            categoryValue = JSON.parse(categoryValue);
          } catch (e) {
          }
        }
        
        const categoryArray = Array.isArray(categoryValue) ? categoryValue : [categoryValue];
        console.log('Applying category filter:', JSON.stringify(categoryArray));
        
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 20;
        const skip = (page - 1) * limit;
        
        const qb = this.repo.createQueryBuilder('article');
        qb.where('article.article_categories @> :categories', {
          categories: JSON.stringify(categoryArray)
        });
        qb.orderBy('article.publishedAt', 'DESC');
        qb.skip(skip);
        qb.take(limit);
        
        const [articles, total] = await qb.getManyAndCount();
        const totalPages = Math.ceil(total / limit);
        
        return {
          data: articles,
          meta: {
            itemsPerPage: limit,
            totalItems: total,
            currentPage: page,
            totalPages: totalPages,
            sortBy: [['publishedAt', 'DESC'] as [string, string]],
            searchBy: [],
            search: '',
            filter: {}
          },
          links: {
            first: `?page=1&limit=${limit}`,
            previous: page > 1 ? `?page=${page - 1}&limit=${limit}` : '',
            current: `?page=${page}&limit=${limit}`,
            next: page < totalPages ? `?page=${page + 1}&limit=${limit}` : '',
            last: `?page=${totalPages}&limit=${limit}`
          }
        };
      } catch (error) {
        console.error('Error applying category filter:', error);
      }
    }
    
    return paginate(query, this.repo, {
      sortableColumns: ['id', 'title', 'publishedAt'],
      searchableColumns: ['title', 'description'],
      defaultSortBy: [['publishedAt', 'DESC'] as [string, string]],
      select: ['id', 'title', 'description', 'link', 'image', 'categories', 'publishedAt'],
      maxLimit: 50,
      defaultLimit: 20,
      filterableColumns: {}
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
