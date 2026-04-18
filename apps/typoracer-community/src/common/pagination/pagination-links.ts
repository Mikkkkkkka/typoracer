import { Request } from 'express';
import { PaginationParams } from './pagination.models';

export function buildPaginationLinkHeader(
  request: Request,
  pagination: PaginationParams,
  hasNextPage: boolean,
): string | undefined {
  const links: string[] = [];

  if (pagination.page > 1) {
    links.push(
      `${buildPageLink(request, pagination.page - 1, pagination.limit)}; rel="prev"`,
    );
  }

  if (hasNextPage) {
    links.push(
      `${buildPageLink(request, pagination.page + 1, pagination.limit)}; rel="next"`,
    );
  }

  return links.length > 0 ? links.join(', ') : undefined;
}

function buildPageLink(request: Request, page: number, limit: number): string {
  const searchParams = new URLSearchParams();

  for (const [key, rawValue] of Object.entries(request.query)) {
    if (key === 'page' || key === 'limit') {
      continue;
    }

    const values = Array.isArray(rawValue) ? rawValue : [rawValue];

    for (const value of values) {
      if (typeof value === 'string') {
        searchParams.append(key, value);
      }
    }
  }

  searchParams.set('page', String(page));
  searchParams.set('limit', String(limit));

  return `<${request.path}?${searchParams.toString()}>`;
}
