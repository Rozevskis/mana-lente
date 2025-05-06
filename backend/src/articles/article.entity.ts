import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('articles')
export class Article {
  @PrimaryGeneratedColumn({ name: 'article_id' })
  id: number;

  @Column({ name: 'article_title' })
  title: string;

  @Column({ name: 'article_link' })
  link: string;

  @Column({ name: 'article_description', nullable: true, type: 'text' })
  description: string;

  @Column({ name: 'article_image', nullable: true })
  image: string;

  @Column({ name: 'published_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  publishedAt: Date;

  @Column({ name: 'article_categories', type: 'jsonb', nullable: true })
  categories: string[];
}
