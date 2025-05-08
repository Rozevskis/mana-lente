import { Controller, Get, Query, Req, UseGuards, Logger } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { Article } from './article.entity';
import { Paginate, PaginateQuery, Paginated } from 'nestjs-paginate';
import { Request } from 'express';
import { User } from '../users/user.entity';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';

interface RequestWithUser extends Request {
  user?: User;
}

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  findAll(@Paginate() query: PaginateQuery): Promise<Paginated<Article>> {
    return this.articlesService.findAll(query);
  }

  @Get('sorted')
  @UseGuards(OptionalJwtAuthGuard)
  async findAllWithSorting(
    @Paginate() query: PaginateQuery,
    @Query('biases') biasesParam: string,
    @Query('debug') debug: string,
    @Req() request: RequestWithUser
  ) {
    // Parse biases from query parameter if provided
    const biases = biasesParam ? JSON.parse(biasesParam) : null;
    
    // Get user from request if authenticated (OptionalJwtAuthGuard will set this if token is valid)
    const user = request.user || null;
    
    if (user) {
      Logger.debug(`User authenticated: ${user.id}, ${user.email}`);
    } else {
      Logger.debug('No authenticated user found');
    }
    
    // Log user and biases for debugging
    Logger.debug(`User: ${user ? 'authenticated' : 'not authenticated'}, Biases: ${biasesParam}`);
    
    // Parse debug flag
    const isDebugMode = debug === 'true';
    
    return this.articlesService.findAllWithSorting(query, biases, user, isDebugMode);
  }
}
