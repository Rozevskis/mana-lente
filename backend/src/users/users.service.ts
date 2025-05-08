import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // ... existing code ...

  async updateCategoryBiases(
    userId: string,
    categoryBiases: Record<string, number>,
  ): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    const MIN_BIAS = 0.1;
    const MAX_BIAS = 0.9;
    
    const validatedBiases: Record<string, number> = {};
    for (const [category, value] of Object.entries(categoryBiases)) {
      validatedBiases[category] = Math.max(MIN_BIAS, Math.min(MAX_BIAS, value));
    }

    user.categoryBiases = validatedBiases;
    return this.userRepository.save(user);
  }
}
