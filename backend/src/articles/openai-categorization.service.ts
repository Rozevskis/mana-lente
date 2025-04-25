import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Article } from './article.entity';
import OpenAI from 'openai';

interface CategorizationResult {
  articleId: string;
  categories: string[];
}

@Injectable()
export class OpenaiCategorizationService {
  private readonly openai: OpenAI;
  private readonly model: string;
  private readonly categories: string[];

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    this.openai = new OpenAI({ apiKey });
    this.model = this.configService.get<string>('OPENAI_MODEL', 'gpt-3.5-turbo');

    // Ensure categories is always an array
    const categoriesConfig = this.configService.get<string | string[]>('ARTICLE_CATEGORIES');
    this.categories = Array.isArray(categoriesConfig)
      ? categoriesConfig
      : [
          'Arts, culture, entertainment, and media',
          'Conflict, war, and peace',
          'Crime, law, and justice',
          'Disaster, accidents, and emergency incidents',
          'Economy, business and finance',
          'Education',
          'Environment',
          'Health',
          'Human interest',
          'Labor',
          'Lifestyle and leisure',
          'Politics',
          'Religion and belief',
          'Science and technology',
          'Society',
          'Sport',
          'Weather',
        ];
  }

  async categorizeArticles(articles: Article[]): Promise<CategorizationResult[]> {
    const prompt = this.buildPrompt(articles);

    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful assistant that categorizes news articles into predefined categories.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.2,
      });

      //   LOG REQUEST
      //   console.log('Would send request to OpenAI with:');
      //   console.log('Model:', this.model);
      //   console.log('Categories:', this.categories);
      //   console.log('Prompt:', prompt);
      //   console.log(
      //     'Articles to categorize:',
      //     articles.map((a) => ({ id: a.id, title: a.title })),
      //   );

      const result = response.choices[0]?.message?.content;
      if (!result) {
        throw new Error('No response from OpenAI');
      }
      // Mock response for testing
      //   const mockResponse = articles.map((article) => ({
      //     articleId: article.id.toString(),
      //     categories: ['Science and technology', 'Education'], // Mock categories
      //   }));
      return this.parseResponse(result, articles);
      //   return mockResponse;
    } catch (error) {
      //  console.error('Error calling OpenAI API:', error);
      console.error('Error in categorization:', error);
      throw error;
    }
  }

  private buildPrompt(articles: Article[]): string {
    const articlesText = articles
      .map(
        (article, index) => `
Article ${index + 1}:
ID: ${article.id}
Title: ${article.title}
Description: ${article.description}
`,
      )
      .join('\n');

    return `
Please categorize the following articles into one or more of these categories: ${this.categories.join(', ')}.

For each article, provide the article ID and the most relevant categories, ordered from most relevant to least relevant. Format your response as a JSON array of objects with "articleId" and "categories" fields.

Articles:
${articlesText}

Response format example:
[
  {
    "articleId": "123",
    "categories": ["Science and technology", "Education"] // First category is most relevant
  }
]
`;
  }

  private parseResponse(response: string, articles: Article[]): CategorizationResult[] {
    try {
      const results = JSON.parse(response);
      if (!Array.isArray(results)) {
        throw new Error('Response is not an array');
      }

      return results.map((result) => ({
        articleId: result.articleId,
        categories: Array.isArray(result.categories) ? result.categories : [],
      }));
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      throw new Error('Failed to parse OpenAI response');
    }
  }
}
