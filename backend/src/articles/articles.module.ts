import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ArticlesService } from './articles.service';
import { ArticlesController } from './articles.controller';
import { Article } from './article.entity';
import { CategorizationService } from './categorization.service';

@Module({
  imports: [TypeOrmModule.forFeature([Article]), ConfigModule],
  controllers: [ArticlesController],
  providers: [ArticlesService, CategorizationService],
  exports: [ArticlesService, CategorizationService],
})
export class ArticlesModule {}
