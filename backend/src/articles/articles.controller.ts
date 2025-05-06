import { Controller, Get, Query } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { Article } from './article.entity';
import { Paginate, PaginateQuery, Paginated } from 'nestjs-paginate';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  findAll(@Paginate() query: PaginateQuery): Promise<Paginated<Article>> {
    return this.articlesService.findAll(query);
  }
}
