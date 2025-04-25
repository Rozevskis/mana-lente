import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Article } from './article.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CategorizationService {
  private readonly batchSize: number;
  private readonly maxArticles: number;

  constructor(
    @InjectRepository(Article)
    private articleRepository: Repository<Article>,
    private configService: ConfigService,
  ) {
    this.batchSize = this.configService.get<number>('CATEGORIZATION_BATCH_SIZE', 10);
    this.maxArticles = this.configService.get<number>('MAX_ARTICLES_TO_CATEGORIZE', 50);
  }

  private async findUncategorizedArticles(): Promise<Article[]> {
    const potentialArticles = await this.articleRepository.find({
      where: [{ categories: IsNull() }, { categories: '[]' }],
      order: {
        publishedAt: 'DESC',
      },
    });

    return potentialArticles.filter(
      (article) => !article.categories || article.categories.length === 0,
    );
  }

  async processUncategorizedArticles(): Promise<void> {
    const allUncategorized = await this.findUncategorizedArticles();
    const totalToProcess = Math.min(allUncategorized.length, this.maxArticles);

    if (totalToProcess === 0) {
      console.log('No uncategorized articles found');
      return;
    }

    console.log(
      `Found ${allUncategorized.length} uncategorized articles (processing max ${this.maxArticles})`,
    );

    let batchCount = 1;
    while (allUncategorized.length > 0) {
      const batch = allUncategorized.splice(0, this.batchSize);

      if (batch.length < this.batchSize) {
        console.log(
          `Skipping batch ${batchCount} as it doesn't have enough articles to process: ${batch.length} articles`,
        );
        break; // Stop processing if a batch is smaller than the expected size
      }

      const articleIds = batch.map((article) => article.id);
      console.log(
        `Processing batch ${batchCount} with ${batch.length} articles: [${articleIds.join(', ')}]`,
      );

      batchCount++;
    }

    console.log('Articles  categorized');
  }
}
