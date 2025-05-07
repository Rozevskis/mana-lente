import { Controller, Get, Query, Req, UseGuards, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ArticlesService } from './articles.service';
import { Article } from './article.entity';
import { Paginate, PaginateQuery, Paginated } from 'nestjs-paginate';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user?: any;
}

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  findAll(@Paginate() query: PaginateQuery): Promise<Paginated<Article>> {
    return this.articlesService.findAll(query);
  }

  @Get('sorted')
  // not using @UseGuards here because we want to support both authenticated and non-authenticated users
  findAllWithSorting(
    @Paginate() query: PaginateQuery,
    @Query('biases') biasesParam: string,
    @Query('debug') debug: string,
    @Req() request: RequestWithUser
  ) {
    // Parse biases from query parameter if provided
    const biases = biasesParam ? JSON.parse(biasesParam) : null;
    
    // Get user from request if authenticated
    const user = request.user;
    
    // Log user and biases for debugging
    Logger.debug(`User: ${JSON.stringify(user)}, Biases: ${biasesParam}`);
    
    // Parse debug flag
    const isDebugMode = debug === 'true';
    
    return this.articlesService.findAllWithSorting(query, biases, user, isDebugMode);
  }
}
