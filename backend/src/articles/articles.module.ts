import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ArticlesService } from './articles.service';
import { ArticlesController } from './articles.controller';
import { Article } from './article.entity';
import { CategorizationService } from './categorization.service';
import { OpenaiCategorizationService } from './openai-categorization.service';
import { RssScraperService } from './rss-scraper.service';

@Module({
  imports: [TypeOrmModule.forFeature([Article]), ConfigModule],
  controllers: [ArticlesController],
  providers: [
    ArticlesService,
    CategorizationService,
    OpenaiCategorizationService,
    RssScraperService,
  ],
  exports: [ArticlesService, CategorizationService, RssScraperService],
})
export class ArticlesModule {}
