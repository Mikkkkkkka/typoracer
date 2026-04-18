import { PaginationParams, PaginatedResult } from '../common/pagination/pagination.models';
import { PaginationInput, PageInfoType } from './types/pagination.input';

export function normalizePagination(
  pagination?: PaginationInput | null,
): PaginationParams {
  return {
    page: pagination?.page ?? 1,
    limit: pagination?.limit ?? 20,
  };
}

export function buildPageInfo(
  pagination: PaginationParams,
  hasNextPage: boolean,
): PageInfoType {
  return {
    page: pagination.page,
    limit: pagination.limit,
    hasNextPage,
  };
}

export function buildPage<TPage extends { items: TItem[]; pageInfo: PageInfoType }, TItem>(
  pagination: PaginationParams,
  result: PaginatedResult<TItem>,
): TPage {
  return {
    items: result.items,
    pageInfo: buildPageInfo(pagination, result.hasNextPage),
  } as TPage;
}
