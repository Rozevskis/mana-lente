import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('preferences')
  @UseGuards(JwtAuthGuard)
  async updatePreferences(@Req() req, @Body() body: { categoryBiases: Record<string, number> }) {
    return this.usersService.updateCategoryBiases(req.user.id, body.categoryBiases);
  }
}
