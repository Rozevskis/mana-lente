import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ConfigService } from '@nestjs/config';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column('jsonb', {
    default: () => {
      const configService = new ConfigService();
      const categoriesStr = configService.get<string>('ARTICLE_CATEGORIES');
      if (!categoriesStr) {
        return "'{}'";
      }

      // Clean up the string - remove any extra commas and whitespace
      const cleanStr = categoriesStr
        .replace(/,\s*\]/g, ']') // Remove trailing commas
        .replace(/,\s*,/g, ',') // Remove double commas
        .trim();

      try {
        const categories = JSON.parse(cleanStr);
        if (!Array.isArray(categories)) {
          return "'{}'";
        }

        const defaultBiases = categories.reduce((acc, category) => {
          if (typeof category === 'string') {
            acc[category] = 0.5;
          }
          return acc;
        }, {});

        // Properly escape the JSON for SQL
        return `'${JSON.stringify(defaultBiases).replace(/'/g, "''")}'`;
      } catch (error) {
        console.error('Error parsing ARTICLE_CATEGORIES:', error);
        return "'{}'";
      }
    },
  })
  categoryBiases: Record<string, number>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
