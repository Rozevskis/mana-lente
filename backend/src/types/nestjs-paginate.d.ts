declare module 'nestjs-paginate' {
  import { Repository } from 'typeorm';

  export interface PaginateQuery {
    page?: number | string;
    limit?: number | string;
    sortBy?: string | string[];
    searchBy?: string | string[];
    search?: string;
    filter?: { [key: string]: string | string[] };
    path?: string;
  }

  export interface PaginationMeta {
    itemsPerPage: number;
    totalItems: number;
    currentPage: number;
    totalPages: number;
    sortBy: [string, string][];
    searchBy: string[];
    search: string;
    filter: { [key: string]: string | string[] };
  }

  export interface PaginationLinks {
    first?: string;
    previous?: string;
    current: string;
    next?: string;
    last?: string;
  }

  export interface Paginated<T> {
    data: T[];
    meta: PaginationMeta;
    links: PaginationLinks;
  }

  export interface PaginateConfig {
    sortableColumns: string[];
    nullSort?: 'first' | 'last';
    searchableColumns?: string[];
    maxLimit?: number;
    defaultLimit?: number;
    defaultSortBy?: [string, string][];
    defaultSortDirection?: 'ASC' | 'DESC';
    filterableColumns?: { [key: string]: boolean | FilterOperator[] };
    select?: string[];
    where?: any;
  }

  export type FilterOperator = 
    | '$eq'
    | '$not'
    | '$null'
    | '$in'
    | '$contains'
    | '$starts'
    | '$ends'
    | '$lt'
    | '$lte'
    | '$gt'
    | '$gte'
    | '$btw';

  export function paginate<T>(
    query: PaginateQuery,
    repo: Repository<T>,
    config: PaginateConfig
  ): Promise<Paginated<T>>;

  export function Paginate(): ParameterDecorator;
}
